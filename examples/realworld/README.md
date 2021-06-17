# Realworld

Take a moment to familiarize yourself with [RealWorld API Spec](https://github.com/gothinkster/realworld/tree/master/api)

```
apitest examples/realworld --ci

main
  prepare ✔
auth
  Register (1.046) ✔
  Login (0.643) ✔
  Current User (0.750) ✔
  Update User (0.583) ✔
article1
  All Articles (0.810) ✔
  Articles by Author (0.590) ✔
  Articles Favorited by Username (1.354) ✔
  Articles by Tag (1.014) ✔
article2
  Create Article (0.690) ✔
  Feed (0.365) ✔
  All Articles with auth (1.256) ✔
  Articles by Author with auth (0.520) ✔
  Articles Favorited by Username with auth (0.477) ✔
  Single Article by slug (0.544) ✔
  Articles by Tag (0.911) ✔
  Update Article (0.643) ✔
  Favorite Article (0.578) ✔
  Unfavorite Article (0.547) ✔
  Create Comment for Article (0.545) ✔
  All Comments for Article (0.654) ✔
  All Comments for Article without auth (0.550) ✔
  Delete Comment for Article (0.531) ✔
  Delete Article (0.550) ✔
profile
  Register Celeb (0.582) ✔
  Profile (0.493) ✔
  Follow Profile (0.535) ✔
  Unfollow Profile (0.604) ✔
tag
  All Tags (1.388) ✔
```

Apites will execute the test cases in sequence and print the test result.