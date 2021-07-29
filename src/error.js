export default [
  "No problem",   /* everythis is ok, return code 0 */
  [
    /* user related errors - code start from 1xx */
    [
      /* login errors - code start from 10x */
      "Wrong username or password",
      "Session Expired or never logged in."
    ],
    [   
      /* user register errors - code start from 11x */
      "Bad password: at least six characters required",
      "This username is already in use"
    ],
    [   
      /* user querying errors - code start from 12x */
      "User not found"
    ]
  ],
  [
    /* post related errors - code start from 2xx */  
    [ 
      /* posting errors - code start from 20x */
      "No image uploaded." 
    ]
  ]
]