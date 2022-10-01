const bcrypt = require('bcryptjs')

exports.compare = ({ password, hash }) => bcrypt.compare(password, hash)
exports.hash = ({ password, hashSize }) => bcrypt.hash(password, hashSize)
