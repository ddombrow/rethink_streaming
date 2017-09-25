
const ora = require('ora');
const LineByLineReader = require('line-by-line')
const lr = new LineByLineReader('./companies.json');
var r = require('rethinkdbdash')({
	servers: [{ host: "localhost", port: "28015"}]
});

const spinner = ora('Preparing data').start();

const doc = { companies: [] };

let lcount = 0;
lr.on("line", function(line, lineCount, byteCount) {
	if (lcount <= 50) {
		doc.companies.push(JSON.parse(line));
	}
	lcount++;
});

lr.on("error", function(e) {
	spinner.fail("Failed to process.");
	console.log(e);
});

lr.on("end", function(something) {
	r.db("dd").table("startups").insert(doc).run()
		.then(res => {
			console.log(res);
			spinner.succeed("All done.");
			console.log(`Wrote ${doc.companies.length} lines out of ${lcount} to a doc.`);
			process.exit(0);
		})
		.catch(e => {
			spinner.fail("Nope.")
			console.log(e);
			process.exit(1);
		});
});

setTimeout(() => {
	if (spinner.color == "green") {
		spinner.color = "yellow";
	}
	else {
		spinner.color = "green";
	}
}, 1000);
