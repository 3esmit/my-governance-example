import EmbarkJS from '../embarkArtifacts/embarkjs';
import MyGovernance from '../embarkArtifacts/contracts/MyGovernance';
import React from 'react';
import ReactDOM from 'react-dom';
import classnames from 'classnames';
import {TabContent, TabPane, Navbar, Nav, NavItem, NavLink, NavbarBrand, NavbarToggler, Collapse} from 'reactstrap';
import CreateProposal from './js/CreateProposal';
import ListProposals from './js/ListProposals';
import Ethereum from './js/Ethereum';
import Account from './js/Account';
//import './css/dapp.css';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      blockchainEnabled: false,
      accounts: [],
      strError: "",
      activeKey: '1',
      latestBlock: null
    };
  }

  componentDidMount() {

  }

  handleSelect(key) {
    this.setState({activeKey: key});
  }

  onBlockUpdate(latestBlock){
    this.setState({ latestBlock })
  }

  onAccountChange(accounts ) {
    this.setState({ accounts })
  }

  render() {
    const {accounts, latestBlock, activeKey, toggle} = this.state;
    return (
    <React.Fragment>
      <div id="header">
        <Navbar color="faded" light>
          <NavbarBrand href="/" className="mr-auto">My Governance Example</NavbarBrand>
          <Nav tabs>
              <NavItem>
                <NavLink onClick={() => this.handleSelect('1')} className={classnames({ active: activeKey === '1' })}>
                  List of Proposals
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink onClick={() => this.handleSelect('2')} className={classnames({ active: activeKey === '2' })}>
                  Create Proposal
                </NavLink>
              </NavItem>
            </Nav>
          <NavbarToggler onClick={()=> this.setState({toggle: !toggle})} className="mr-2" />
            <Collapse isOpen={!toggle} navbar>
              <Nav vertical>
                <NavItem>
                  <Account onChange={(accounts) => this.onAccountChange(accounts)}/>
                </NavItem>
              </Nav>
          </Collapse>
        </Navbar>
      </div>
      <div id="main">
        <TabContent activeTab={activeKey}>
          <TabPane tabId="1">
            <ListProposals latestBlock={latestBlock} accounts={accounts}/>
          </TabPane>
          <TabPane tabId="2">
            <CreateProposal latestBlock={latestBlock} accounts={accounts}/>
          </TabPane>
        </TabContent>
      </div>
      <div id="footer">

        <Ethereum onBlockUpdate={(latestBlock) => this.onBlockUpdate(latestBlock)}/>
      </div>
    </React.Fragment>);
  }
}

ReactDOM.render(<App></App>, document.getElementById('app'));