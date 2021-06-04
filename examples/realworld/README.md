# Realworld

Take a moment to familiarize yourself with [RealWorld API Spec](https://github.com/gothinkster/realworld/tree/master/api)

```
apitest examples/realworld

module main
  prepare ✔
module auth
  Register (0.869) ✔
  Login (0.644) ✔
  Current User (0.578) ✔
  Update User (0.598) ✔
module article1
  All Articles (0.762) ✔
  Articles by Author (0.507) ✔
  Articles Favorited by Username (0.490) ✔
  Articles by Tag (0.832) ✔
module article2
  Create Article (0.625) ✔
  Feed (0.591) ✔
  All Articles with auth (1.193) ✔
  Articles by Author with auth (0.573) ✔
  Articles Favorited by Username with auth (0.569) ✔
  Single Article by slug (0.623) ✔
  Articles by Tag (0.879) ✔
  Update Article (0.739) ✔
  Favorite Article (0.619) ✔
  Unfavorite Article (0.617) ✔
  Create Comment for Article (0.618) ✔
  All Comments for Article (0.594) ✔
  All Comments for Article without auth (0.616) ✔
  Delete Comment for Article (0.602) ✔
  Delete Article (0.635) ✔
module profile
  Register Celeb (0.659) ✔
  Profile (0.552) ✔
  Follow Profile (0.606) ✔
  Unfollow Profile (0.526) ✘
module tag
  All Tags (1.561) ✔

1. Unfollow Profile(profile.unfollowProfile)
   profile.unfollowProfile.res.body.profile.following: true ≠ false
```

Apites will execute the test cases in sequence and print the test results.