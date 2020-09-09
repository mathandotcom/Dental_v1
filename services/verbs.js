const Enum = require('enum')

const verbs = new Enum (
    GET = 'GET',
    PUT = 'PUT',
    POST = 'POST',
    DELETE = 'DELETE'
)

module.exports = verbs;