var React = require('react');
var ReactDOM = require('react-dom');
import oboe from "oboe";

class Main extends React.Component {
	componentDidMount() {
		//oboe("/startup/stream1/5cd68afc-51f1-4f1c-b031-cc22636cfef4")
		oboe("/startup/stream1/7afe5571-ecba-4bf8-bcb5-728f9fd16ad0")
			.node("*.companies.*", (item, path) => {
				console.log(path);
			})
			.done(full => {
				console.log("done.");
			});
	}

	render() {
		return (
		<div>
			Hello World
		</div>
		);
	}
};

ReactDOM.render(<Main />, document.getElementById('app'));