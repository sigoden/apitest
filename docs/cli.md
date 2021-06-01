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

For example, When run with options `--env dev`, apitest will load `main.dev.jsona` as entrypoint;

## target

If target is omit, apitest will search entrypoint jsona in following paths:
- `<cwd>`/main.jsona
- `<cwd>`/`<basename>`.jsona

Apitest will use `<cwd>` as workdir to search other modules and jslibs.


## ci 

ci mode means:
- start from the frist test unit
- do not abort when test unit failed
- print errors when all test units done

## reset

apitest will start from last failed test unit. `--reset` make apitest starting from first test unit.
