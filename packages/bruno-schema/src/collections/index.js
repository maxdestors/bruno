const Yup = require('yup');
const { uidSchema } = require('../common');

const environmentVariablesSchema = Yup.object({
  uid: uidSchema,
  name: Yup.string().nullable(),
  value: Yup.string().nullable(),
  type: Yup.string().oneOf(['text']).required('type is required'),
  enabled: Yup.boolean().defined(),
  secret: Yup.boolean()
})
  .noUnknown(true)
  .strict();

const environmentSchema = Yup.object({
  uid: uidSchema,
  name: Yup.string().min(1).required('name is required'),
  variables: Yup.array().of(environmentVariablesSchema).required('variables are required')
})
  .noUnknown(true)
  .strict();

const environmentsSchema = Yup.array().of(environmentSchema);

const keyValueSchema = Yup.object({
  uid: uidSchema,
  isFile: Yup.boolean().nullable(),
  name: Yup.string().nullable(),
  value: Yup.string().nullable(),
  description: Yup.string().nullable(),
  enabled: Yup.boolean()
})
  .noUnknown(true)
  .strict();

const varsSchema = Yup.object({
  uid: uidSchema,
  name: Yup.string().nullable(),
  value: Yup.string().nullable(),
  description: Yup.string().nullable(),
  local: Yup.boolean(),
  enabled: Yup.boolean()
})
  .noUnknown(true)
  .strict();

const requestUrlSchema = Yup.string().min(0).defined();
const requestMethodSchema = Yup.string()
  .oneOf(['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'])
  .required('method is required');

const graphqlBodySchema = Yup.object({
  query: Yup.string().nullable(),
  variables: Yup.string().nullable()
})
  .noUnknown(true)
  .strict();

const requestBodySchema = Yup.object({
  mode: Yup.string()
    .oneOf(['none', 'json', 'text', 'xml', 'formUrlEncoded', 'multipartForm', 'graphql'])
    .required('mode is required'),
  json: Yup.string().nullable(),
  text: Yup.string().nullable(),
  xml: Yup.string().nullable(),
  formUrlEncoded: Yup.array().of(keyValueSchema).nullable(),
  multipartForm: Yup.array().of(keyValueSchema).nullable(),
  graphql: graphqlBodySchema.nullable()
})
  .noUnknown(true)
  .strict();

const authBasicSchema = Yup.object({
  username: Yup.string().nullable(),
  password: Yup.string().nullable()
})
  .noUnknown(true)
  .strict();

const authBearerSchema = Yup.object({
  token: Yup.string().nullable()
})
  .noUnknown(true)
  .strict();

const authSchema = Yup.object({
  mode: Yup.string().oneOf(['none', 'basic', 'bearer']).required('mode is required'),
  basic: authBasicSchema.nullable(),
  bearer: authBearerSchema.nullable()
})
  .noUnknown(true)
  .strict();

// Right now, the request schema is very tightly coupled with http request
// As we introduce more request types in the future, we will improve the definition to support
// schema structure based on other request type
const requestSchema = Yup.object({
  url: requestUrlSchema,
  method: requestMethodSchema,
  headers: Yup.array().of(keyValueSchema).required('headers are required'),
  params: Yup.array().of(keyValueSchema).required('params are required'),
  auth: authSchema,
  body: requestBodySchema,
  script: Yup.object({
    req: Yup.string().nullable(),
    res: Yup.string().nullable()
  })
    .noUnknown(true)
    .strict(),
  vars: Yup.object({
    req: Yup.array().of(varsSchema).nullable(),
    res: Yup.array().of(varsSchema).nullable()
  })
    .noUnknown(true)
    .strict()
    .nullable(),
  assertions: Yup.array().of(keyValueSchema).nullable(),
  tests: Yup.string().nullable()
})
  .noUnknown(true)
  .strict();

const itemSchema = Yup.object({
  uid: uidSchema,
  type: Yup.string().oneOf(['http-request', 'graphql-request', 'folder']).required('type is required'),
  seq: Yup.number().min(1),
  name: Yup.string().min(1, 'name must be atleast 1 characters').required('name is required'),
  request: requestSchema.when('type', {
    is: (type) => ['http-request', 'graphql-request'].includes(type),
    then: (schema) => schema.required('request is required when item-type is request')
  }),
  items: Yup.lazy(() => Yup.array().of(itemSchema)),
  filename: Yup.string().nullable(),
  pathname: Yup.string().nullable()
})
  .noUnknown(true)
  .strict();

const collectionSchema = Yup.object({
  version: Yup.string().oneOf(['1']).required('version is required'),
  uid: uidSchema,
  name: Yup.string().min(1, 'name must be atleast 1 characters').required('name is required'),
  items: Yup.array().of(itemSchema),
  activeEnvironmentUid: Yup.string()
    .length(21, 'activeEnvironmentUid must be 21 characters in length')
    .matches(/^[a-zA-Z0-9]*$/, 'uid must be alphanumeric')
    .nullable(),
  environments: environmentsSchema,
  pathname: Yup.string().nullable(),
  runnerResult: Yup.object({
    items: Yup.array()
  }),
  collectionVariables: Yup.object(),
  brunoConfig: Yup.object()
})
  .noUnknown(true)
  .strict();

module.exports = {
  requestSchema,
  itemSchema,
  environmentSchema,
  environmentsSchema,
  collectionSchema
};
