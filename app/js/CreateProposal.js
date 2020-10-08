import MyGovernance from '../../embarkArtifacts/contracts/MyGovernance';
import React from 'react';
import {Form, FormGroup, Input, Button, FormText} from 'reactstrap';
import moment from 'moment';
import Datetime from 'react-datetime';
import "react-datetime/css/react-datetime.css";
import TransactionSubmitButton from './components/TransactionSubmitButton';

class CreateProposal extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
        proposalDestination: "0x0000000000000000000000000000000000000000",
        proposalCalldata: "0x",
        startTime: moment(),
        endTime: moment(),
        contenthash: "0x",
        timestamp: 0,
        defaultAccount: null
    };
  }

  handleChange(v, e) {
    console.log(v,e)
    this.setState({ [v]: e });
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

  render() {
    const {defaultAccount, timestamp, proposalDestination, proposalCalldata, startTime, endTime, contenthash} = this.state;
    return (<React.Fragment>
        <h3> Create a Proposal</h3>
        <Form>
            <FormGroup className="inline-input-btn">
            <small className="text-secondary">Proposal Destination:</small>
            <Input
                type="text"
                defaultValue={proposalDestination}
                onChange={(e) => this.handleChange('proposalDestination' ,e.target.value)}/>

            <small className="text-secondary">Proposal Calldata:</small>
            <Input
                type="text"
                defaultValue={proposalCalldata}
                onChange={(e) => this.handleChange('proposalCalldata' ,e.target.value)}/>

            <small className="text-secondary">Vote period start:</small>
            <Datetime
              value={startTime}
              onChange={(e) => this.handleChange('startTime' ,e)}/>
              
            <small className="text-secondary">Vote period end:</small>
            <Datetime
              value={endTime}
              onChange={(e) => this.handleChange('endTime' ,e)}/>

            <small className="text-secondary">Proposal Contenthash:</small>
            <Input
                type="text"
                defaultValue={contenthash}
                onChange={(e) => this.handleChange('contenthash', e.target.value)}/>
            
            <TransactionSubmitButton 
              account={defaultAccount}
              text="Add Proposal"
              sendTransaction={
                MyGovernance.methods.createProposal(proposalDestination, proposalCalldata, startTime.format('X'), endTime.format('X'), contenthash)
              }
              color="success"
              />
            <FormText color="muted">Once you set the value, the transaction will need to be mined and then the value will be updated
              on the blockchain.</FormText>
          </FormGroup>
        </Form>
      </React.Fragment>
    );
  }
}

export default CreateProposal;
