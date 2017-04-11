# Breakster

[![Build Status](https://travis-ci.org/idchlife/breakster.svg?branch=master)](https://travis-ci.org/idchlife/breakster)

Tool that breaks your html into "reacty" (React, Preact) components, saving their
code into files. Imports of children components, JSX with children components,
etc - you're all set.

## Installation

```
  npm install breakster --global
```

## Usage

Basically:

```
   breakster --entry=your_html.html --outDir=/your_directory
   
```

First, let's observe this example html that will be breaked into files with components code in them.
(taken from tests folder, file entry1.html)

```html
<html>
  <head>
    <title></title>
  </head>
  <body>
    <div b-comp b-dialect="typescript" b-name="IndexPage">
      <div b-comp b-name="Layout">
        <header>
          <div>User</div>
          <div b-comp b-name="UserInfo">
            <div class="user-info-class">Username: Alan</div>
          </div>
        </header>
        <div b-comp b-name="Product">
          <div>Product name</div>
          <div>Product price</div>
          <div>Product count</div>
          <div b-comp b-jsx-lib="react" b-name="BuyButton">
            <button>buy</button>
            <div>
              <div>Buy as</div>
              <div b-comp b-name="UserInfo"></div>
            </div>
          </div>
        </div>
        <table b-comp b-name="Table">
          <thead>
            <tr>
              <td>Header first</td>
              <td>Header second</td>
              <td>Header third</td>
            </tr>
          </thead>
          <tbody>
            <tr b-comp b-name="TableRow">
              <td>First</td>
              <td>Second</td>
              <td>Third</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </body>
</html>
```

So, you see some attributes that are not your common html attributes.
With the help of those Breakster knows what should be breaked and saved into components.

In the output folder you would see:

![image](https://cloud.githubusercontent.com/assets/4563032/24829271/181fd4c2-1c77-11e7-993f-e6852cdad656.png)

And this is what inside of IndexPage.tsx file:

![image](https://cloud.githubusercontent.com/assets/4563032/24930721/3579403c-1f13-11e7-9948-447550141c7f.png)

(the return of render method could not be that pretty (it's WIP), maybe you will need some tweeks with indentation)

Don't be frightened by .tsx files. It's just the behaviour of b-dialect attribute at top div. Without this attribute Breakster will save .jsx files.

### Attributes overview

- **b-comp** - main attribute that tells that this is a root element for future component.
Future component could not live without a name, so b-comp always should be used with b-name.
- **b-name="ComponentName"** - this attribute defines components name. Name of component class and also name of file, where code will be saved.
- **b-dialect="javascript|typescript"** - this attribute tells which dialect your code should be in. For now there are 2: "javascript" (default, should not be used, because it's enabled by default) and "typescript". File for component is saved with extension based on chosen dialect. Jsx or Tsx for now. **if you have this attribute at top level element, all inner component would use dialect defined at top, as in example**
- **b-jsx-lib="preact|react"** - this attribute will tell which `reacty` (react-like api) should be used in this component. Default is Preact. What do I mean by "used in this component"? Import will be from library you define.

## Development

Issues, tests and ideas are welcome!

## Contributing

1. Fork it ( https://github.com/idchlife/breakster/fork )
2. Create your feature branch (git checkout -b my-new-feature)
3. Commit your changes (git commit -am 'Add some feature')
4. Push to the branch (git push origin my-new-feature)
5. Create a new Pull Request

## Contributors

- [idchlife](https://github.com/idchlife) idchlife - creator, maintainer