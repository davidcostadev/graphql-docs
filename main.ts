require('isomorphic-fetch');

const fs = require('fs');
const path = require('path');
const { getIntrospectionQuery, buildClientSchema, printSchema } = require('graphql');

const API = process.env.API;

if (!API) {
  throw new Error('API not defined');
}

async function getSchema(api) {
  const response = await fetch(api, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: getIntrospectionQuery() }),
  });

  if (response.status !== 200) {
    throw new Error(`Error ${response.status}, ${response.statusText}`);
  }

  if (!response.headers?.get('content-type')?.includes('application/json')) {
    throw new Error('Invalid content-type');
  }

  const data = (await response.json()).data;
  const graphqlSchemaObj = buildClientSchema(data);
  const sdlString = printSchema(graphqlSchemaObj);

  const file = path.resolve(__dirname, './schema.graphql');
  fs.writeFileSync(file, sdlString);
  return data;
}


interface Schema {
  __schema: {
    queryType: {
      name: string;
    };
    mutationType: {
      name: string;
    };
    subscriptionType: {
      name: string;
    };
    types: {
      name: string;
      kind: string;
      fields: {
        name: string;
        description?: string | null;
        args: {
          name: string;
          type: {
            name: string;
            ofType: {
              name: string;
            };
          };
        }[];
        type: {
          name: string;
        };
      }[];
    }[];
    directives: {
      name: string;
      args: {
        name: string;
      }[];
    }[];
  };
}

async function sorting(jsonSchema: Schema) {
  const types = jsonSchema.__schema.types;


  types.sort((a, b) => {
    return a.name.localeCompare(b.name);
  });

  
  for (let type of types) {
    if (Array.isArray(type.fields)) {
      type.fields.sort((a, b) => {
        return a.name.localeCompare(b.name);
      });

      type.fields = type.fields.map(({description, ...rest}) => {

        if (Array.isArray(rest.args)) {
          const sortedArgs = rest.args.sort((a, b) => {
            return a.name.localeCompare(b.name);
          });

          return {
            ...rest,
            args: sortedArgs.map(arg => ({
              ...arg,
              description: arg.type?.name || arg?.type?.ofType?.name || null,
            })),
            description: null,
          };
        }

        return {
          ...rest,
          description: null,
        };
      });
    }
  }


  const newSchema = JSON.stringify(
    { data: { __schema: { ...jsonSchema.__schema, types: types } } },
    null,
    2
  );
  const file = path.resolve(__dirname, './schema.json');

  fs.writeFileSync(file, newSchema);
}

const main = async () => {
  try {
    const api = API;

    console.log(new Date(), 'getSchema');
    const jsonSchema = await getSchema(api);

    console.log(new Date(), 'sorting');
    await sorting(jsonSchema);
  } catch (error) {
    console.error(error);
    throw error;
  }
};

main();
