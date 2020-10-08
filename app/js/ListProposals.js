import React from 'react';
import EmbarkJS from '../../embarkArtifacts/embarkjs';
import MyGovernance from '../../embarkArtifacts/contracts/MyGovernance';
import Proposal from './Proposal';
import { CardGroup } from 'reactstrap';

class ListProposals extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
        proposals: [],
        totalProposals: 0,
        timestamp: 0,
        defaultAccount: null,
        subscription: null
    };
  }
  componentDidMount() {
    EmbarkJS.onReady((err) => {
        if (err) {
            console.error(err)
        } else {
            this.loadProposals();
            this.subscribeEvents();
        }
    });
  }
  componentWillUnmount(){
    this.unsubscribeEvents();
  }
  loadProposals() {
    MyGovernance.methods.totalProposals().call().then((totalProposals) => {
        this.setState({totalProposals});
    })
  }
  componentDidUpdate(prevProps, prevState, snapshot){
    const {latestBlock, accounts} = this.props;
    const {defaultAccount, timestamp} = this.state;
    if(latestBlock && latestBlock.timestamp != timestamp) {
      this.setState({timestamp: latestBlock.timestamp});
    }
    const currentDefault = web3.eth.defaultAccount || accounts[0];
    if(accounts && accounts.length > 0 && defaultAccount != currentDefault){
      this.setState({defaultAccount: currentDefault});
    }
  }
  subscribeEvents() {
    const {subscription} = this.state;
    if(!subscription){
      this.setState({
          subscription: MyGovernance.events.NewProposal({}, (error, event) => {
              if(error){
                console.error(error) 
              } else {
                this.loadProposals();   
              }
          })
      });
    }
  }
  unsubscribeEvents() {
    const {subscription} = this.state;
    if(subscription){
      subscription.unsubscribe();
      this.setState({subscription:null});
    }
  }
  render() {
    const {defaultAccount, timestamp, totalProposals} = this.state;
    return (<React.Fragment>
        <h3> Proposals List (Total: {totalProposals}) </h3>
        <CardGroup>
        {totalProposals > 0 && [...Array(parseInt(totalProposals)).keys()].map((value, index) => {
          return (<Proposal key={index} defaultAccount={defaultAccount} timestamp={timestamp} proposalId={value}/>)
        })}
        </CardGroup>
      </React.Fragment>
    );
  }
}

export default ListProposals;
