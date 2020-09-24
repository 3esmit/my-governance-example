import React from 'react';
import EmbarkJS from '../../embarkArtifacts/embarkjs';
import MyGovernance from '../../embarkArtifacts/contracts/MyGovernance';
import Proposal from './Proposal';

class ListProposals extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
        proposals: [],
        totalProposals: 0
    };
  }
  
  componentDidMount() {
    EmbarkJS.onReady((err) => {
        if (err) {
            // If err is not null then it means something went wrong connecting to ethereum
            // you can use this to ask the user to enable metamask for e.g
            return this.setState({ strError: err.message || err });
        } else {
            this.loadProposals();
        }
    });
  }
  loadProposals() {
    MyGovernance.methods.totalProposals().call().then((totalProposals) => {
        this.setState({totalProposals});
    })
  }

  render() {
    const {totalProposals} = this.state;
    return (<React.Fragment>
        <h3> Proposals List (Total: {totalProposals}) </h3>
        <ul>
        {totalProposals > 0 && [...Array(parseInt(totalProposals)).keys()].map((value, index) => {
            return (<Proposal key={index} proposalId={value}/>)
        })}
        </ul>
      </React.Fragment>
    );
  }
}

export default ListProposals;
