# HOMEWORK

if your OS is windows please read this link to solve soft link problem: http://stackoverflow.com/a/16754068

## deployment usage:

```SHELL==
$ git clone https://github.com/xturtle/rg-backend.git
$ git clone https://github.com/xturtle/rg-frontend.git
$ cd rg-backend
$ sudo ./deploy.sh

# root permission required for autobind package, allow your linux account using 80 port
```

## test usage:
```SHELL==
# after git clone
$ npm run test
```

# API


## user related funciton


### sign on [POST] [JSON]

proceed to login.

```SHELL==
/api/signon
{
  "username":"jon_dowd",        //string
  "password":"12345"            //string
}
```

result:
```SHELL==
{
  "code": "0",
  "message": "No Problem",
  "payload": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywidXNlcm5hbWUiOiJhbGljZSIsImlhdCI6MTYyNzg4OTI2NCwiZXhwIjoxNjI3OTc1NjY0fQ.kcTUQJodc8oKLItHzd7mAVfUc6H11ygyUXn86z4_E3s" //JWT Token
}
```

possible errors:
code 100: Wrong username or password


### sign up [POST] [JSON]

proceed to register new user.

```SHELL==
/api/signup
{
  "username":"jon_dowd",	//string
  "password":"12345"		//string, must length > 6
}
```

result:
```SHELL==
{
  "code": "0",
  "message": "No Problem",
  "payload": null		
}
```

possible errors:
code 110: Bad password: at least six characters required
code 111: This username is already in use.


## post related function


### get posts [GET] [AuthRequired]

get posts of all or specified users' posts.

```SHELL==
/api/posts/:peopleID?/:offset?/:size?/?recently={true|false}

peopleID: string, use "all" to get all posts.
offset: int, load post from #offset.
size: int, load count of posts.
recently: boolean, load post sort bt time, true=DESC, false=ASC (default is true)

mark as '?' means optional param.
```

result:
```SHELL==
{
  "code": "0",
  "message": "No problem",
  "payload": [
    {
      "id": 1,						//post id
      "uid": 1,						//poster
      "image": "04948030a3d4912a1020e7cb35c768aa.jpg",	//image url
      "text": "Lorem Ipsum ...",			//description
      "createdAt": "2021-08-01T16:29:46.929Z",		//create time
      "updatedAt": "2021-08-01T16:29:46.929Z"		//update time
    },
    ...
  ]
}
```

possible errors:
None.
if criteria too strict to found any posts, [] empty payload will get.


### get a post [GET] [AuthRequired]

get a post.

```SHELL==
/api/post/:postID

postID: int, post id.
```

result:
```SHELL==
{
  "code": "0",
  "message": "No problem",
  "payload": {
    "id": 2,						//post id
    "uid": 2,						//poster id
    "image": "04948030a3d4912a1020e7cb35c768aa.jpg",	//image url
    "text": "Lorem Ipsum...",				//description
    "createdAt": "2021-08-01T16:29:46.929Z",		//create time
    "updatedAt": "2021-08-01T16:29:46.929Z"		//update time
  }
}
```

possible errors:
None.
if post id not found, payload will be null.


### get a user [GET] [AuthRequired]

get a user profile.

```SHELL==
/api/user/:peopleID?

peopleID: string, if not specified, will get current logged in user's profile.
```

result:
```SHELL==
{
  "code": "0",
  "message": "No problem",
  "payload": {
    "id": 2,					//user id
    "username": "kathy",			//user name
    "createdAt": "2021-08-01T16:29:26.085Z",	//create time
    "updatedAt": "2021-08-01T16:29:26.085Z"	//update time
  }
}
```

possible errors:
code 120: User not found.


### submit new post [POST] [x-www-form-urlencoded] [AuthRequired]

submitting new post.

```SHELL==
/api/post
image: the image file url (local)
text: the description of image
```

result:
```SHELL==
{
  "code": "0",
  "message": "No problem",
  "payload": postID		//int, the postID of submitted post.
}

possible errors:
code 200: No image uploaded. 
