# Cli

```
usage: apitest [options] [target]

Options:
  -h, --help     Show help                                             [boolean]
  -V, --version  Show version number                                   [boolean]
      --ci       Whether to run in ci mode                             [boolean]
      --reset    Whether to continue with last case                    [boolean]
      --dry-run  Check syntax then print all cases                     [boolean]
      --env      Specific test enviroment like prod, dev                [string]
      --only     Run specific module/case                               [string]
```

## env

when `--env` is provided, apitest will load main jsona with `env` suffix.
`apitest --env test` will load `main.test.jsona` other than `main.jsona`.

## target

If target is ommit, apitest will search main jsona in follow paths:
- <cwd>/main.jsona
- <cwd>/<basename>.jsona

And apitest will use cwd as workdir to search other modules and jslibs.


## ci 

ci mode means:
- start from the frist test
- do not abort when test failed
- print errors when all tests done

## reset

apitest will start from last failed test. `--reset` make apitest starting from first test.
