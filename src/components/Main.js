var React = require('react');
var ReactDOM = require('react-dom');
const shortid = require("shortid");
import oboe from "oboe";

function CompanyItem(props) {
	const c = props.val;
	return <li>
		<strong>{c.name}</strong><br/>
		<em># of employees: {c.number_of_employees}</em><br/>
		<em>category: {c.category_code}</em>
	</li>;
}

function CompanyList(props) {
	const companies = props.companies;
	const listItems = companies.map(c => {
		return <CompanyItem key={c.key} val={c} />;
	});
	return (
		<ul>{listItems}</ul>
	);
}

class Main extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			companies: [],
			date: new Date()
		};
	}

	componentDidMount() {
		//oboe("/startup/stream1/5cd68afc-51f1-4f1c-b031-cc22636cfef4")
		//oboe("/startup/stream1/7afe5571-ecba-4bf8-bcb5-728f9fd16ad0")
		oboe("/startup/stream3/95485f6e-f2ee-49f6-9f5a-0338408d8106")
			.node("{_id name}", (item) => {
				//console.log(item);
				requestAnimationFrame(() => {
					this.setState({
						companies: this.state.companies.concat(Object.assign(item, { key: shortid.generate() }))
					});
				});
			})
			.done(full => {
				console.log("done.");
			});
	}

	render() {
		return (
		<div>
			<CompanyList companies={this.state.companies} />
		</div>
		);
	}
};

ReactDOM.render(<Main />, document.getElementById('app'));