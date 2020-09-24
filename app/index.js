import EmbarkJS from '../embarkArtifacts/embarkjs';
import MyGovernance from '../embarkArtifacts/contracts/MyGovernance';
import React from 'react';
import ReactDOM from 'react-dom';
import classnames from 'classnames';
import {TabContent, TabPane, Nav, NavItem, NavLink} from 'reactstrap';
import CreateProposal from './js/CreateProposal';
import ListProposals from './js/ListProposals';
//import './css/dapp.css';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      blockchainEnabled: false,
      account: "",
      strError: "",
      activeKey: '1'
    };
  }

  componentDidMount() {
    EmbarkJS.enableEthereum();
    EmbarkJS.onReady((err) => {
        if (err) {
            // If err is not null then it means something went wrong connecting to ethereum
            // you can use this to ask the user to enable metamask for e.g
            return this.setState({ strError: err.message || err });
        }
  
        EmbarkJS.Blockchain.isAvailable().then(blockchainEnabled => {
          if(blockchainEnabled) {
            this.setState({ account: web3.eth.defaultAccount, blockchainEnabled });
          } else {
            this.setState({ account: "", blockchainEnabled});
          }
        });
    });
  }

  handleSelect(key) {
    this.setState({activeKey: key});
  }

  render() {
    if (this.state.strError || !this.state.blockchainEnabled) {
      return (<div>
        <div>Something went wrong connecting to ethereum. Please make sure you have a node running or are using metamask
          to connect to the ethereum network:
        </div>
        <div>{this.state.strError}</div>
      </div>);
    }
    return (<div>
      <h3>My Governance - Example</h3>
      <Nav tabs>
        <NavItem>
          <NavLink onClick={() => this.handleSelect('1')} className={classnames({ active: this.state.activeKey === '1' })}>
            List of Proposals
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink onClick={() => this.handleSelect('2')} className={classnames({ active: this.state.activeKey === '2' })}>
            Create Proposal
          </NavLink>
        </NavItem>
      </Nav>
      <TabContent activeTab={this.state.activeKey}>
        <TabPane tabId="1">
          <ListProposals/>
        </TabPane>
        <TabPane tabId="2">
          <CreateProposal/>
        </TabPane>
      </TabContent>
    </div>);
  }
}

ReactDOM.render(<App></App>, document.getElementById('app'));