# devTinder api

# authRouter
 -post /signup
 -post /login
 -post /logout

# profile Router
-Get/prfile/view
-Patch/profile/edit
-Patch/profile/password

# connection request router
 -post/request/send/interested/:userID
 -post/request/send/ignored/:userID
 -post/request/reviewed/interested/:userID
 -post/request/reviewed/ignored/:userID



  -Get/profile/view
  -patch/profile/edit
  -patch/profile/password



  //pagination
  /feed?page=1&Limit=10=> 1-10first 10 user 1-10
  /feed?page=2&Linit=10=>11-20
  /feed?page=3&Linit=10=>21-30
  .skip(0) & .Limit(10)
   .skip(10) & .limit(10)