# Realworld

Take a moment to familiarize yourself with [RealWorld API Spec](https://github.com/gothinkster/realworld/tree/master/api)

```
main
  prepare ✔
  {
    "req": {
      "username": "eddie554",
      "email": "eddie554@gmail.com",
      "password": "9Ot(zG(2Kq%9"
    },
    "res": {
      "username": "eddie554",
      "email": "eddie554@gmail.com",
      "password": "9Ot(zG(2Kq%9"
    },
    "run": {
      "dump": true
    }
  }
auth
  Register (0.736) ✔
  Login (0.680) ✔
  Current User (0.612) ✔
  Update User (0.595) ✔
article1
  All Articles (1.080) ✔
  Articles by Author (0.640) ✔
  Articles Favorited by Username (0.618) ✔
  Articles by Tag (0.940) ✔
article2
  Create Article (0.692) ✔
  Feed (0.635) ✔
  All Articles with auth (1.732) ✔
  Articles by Author with auth (1.003) ✔
  Articles Favorited by Username with auth (0.610) ✔
  Single Article by slug (0.707) ✔
  Articles by Tag (1.156) ✔
  Update Article (0.714) ✔
  Favorite Article (0.700) ✔
  Unfavorite Article (1.441) ✔
  Create Comment for Article (0.714) ✔
  All Comments for Article (0.683) ✔
  All Comments for Article without auth (0.682) ✔
  Delete Comment for Article (0.664) ✔
  Delete Article (0.628) ✔
profile
  Register Celeb (0.707) ✔
  Profile (0.638) ✔
  Follow Profile (1.112) ✔
  Unfollow Profile (0.613) ✘
tag
  All Tags (1.600) ✔

1. Unfollow Profile(profile.unfollowProfile)
   profile.unfollowProfile.res.body.profile.following: true ≠ false

error Command failed with exit code 1.
```

Apites will execute the test cases in sequence and print the test results.