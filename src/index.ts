import * as htmlparser from "htmlparser2";
import * as domhandler from "domhandler";



const parser: htmlparser.Parser = new htmlparser.Parser({
  onopentag: function(name, attrs) {
    console.info(`Name is ${name} and attrs `, attrs);
  },
  ontext: function(text: string) {
    console.info(`Got text: ${text}`);
  },
  onclosetag: function(name) {
    console.info(`Got closing tag for ${name}`);
  },
  onend: function() {

  }
});

parser.write('<c-layout><div>as<i class="lol"/></div></c-layout>');
parser.end();