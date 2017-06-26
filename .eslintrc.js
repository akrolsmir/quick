module.exports = {
    "extends": "airbnb-base", // ["airbnb-base", "google"],
    "rules": {
      "no-var": 0,
      // "vars-on-top": 0,
      "no-underscore-dangle": 0,
      "object-curly-spacing": 0,

      // Allow for..of loops
      // See https://github.com/airbnb/javascript/issues/1122#issuecomment-266219071
      'no-restricted-syntax': [
        'error',
        'ForInStatement',
        'LabeledStatement',
        'WithStatement',
      ]
    }
};