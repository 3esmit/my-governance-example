import MyGovernance from '../../embarkArtifacts/contracts/MyGovernance';
import React from 'react';
import {Form, FormGroup, Input, Button, FormText} from 'reactstrap';

class CreateProposal extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
        proposalDestination: "0x0000000000000000000000000000000000000000",
        proposalCalldata: "0x",
        startTime: 0,
        endTime: 0,
        contenthash: "0x"
    };
  }

  handleChange(v, e) {
    this.setState({ [v]: e.target.value });
  }

  checkEnter(e, func) {
    if (e.key !== 'Enter') {
      return;
    }
    e.preventDefault();
    func.apply(this, [e]);
  }

  async addProposal(e) {
    e.preventDefault();
    const {proposalDestination, proposalCalldata, startTime, endTime, contenthash} = this.state;
    const result = await MyGovernance.methods.createProposal(proposalDestination, proposalCalldata, startTime, endTime, contenthash).send({gas: 1000000});
    
  }

  render() {
    return (<React.Fragment>
        <h3> Create a Proposal</h3>
        <Form onKeyDown={(e) => this.checkEnter(e, this.addProposal)}>
            <FormGroup className="inline-input-btn">
            <small className="text-secondary">Proposal Destination:</small>
            <Input
                type="text"
                defaultValue={this.state.proposalDestination}
                onChange={(e) => this.handleChange('proposalDestination' ,e)}/>

            <small className="text-secondary">Proposal Calldata:</small>
            <Input
                type="text"
                defaultValue={this.state.proposalCalldata}
                onChange={(e) => this.handleChange('proposalCalldata' ,e)}/>

            <small className="text-secondary">Vote period start:</small>
            <Input
                type="text"
                defaultValue={this.state.startTime}
                onChange={(e) => this.handleChange('startTime' ,e)}/>

            <small className="text-secondary">Vote period end:</small>
            <Input
                type="text"
                defaultValue={this.state.endTime}
                onChange={(e) => this.handleChange('endTime' ,e)}/>

            <small className="text-secondary">Proposal Contenthash:</small>
            <Input
                type="text"
                defaultValue={this.state.contenthash}
                onChange={(e) => this.handleChange('contenthash', e)}/>
              
            <Button color="primary" onClick={(e) => this.addProposal(e)}>Add Proposal</Button>
            <FormText color="muted">Once you set the value, the transaction will need to be mined and then the value will be updated
              on the blockchain.</FormText>
          </FormGroup>
        </Form>
      </React.Fragment>
    );
  }
}

export default CreateProposal;
