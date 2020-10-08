import React from 'react';
import MyGovernance from '../../embarkArtifacts/contracts/MyGovernance';
import TransactionSubmitButton from './components/TransactionSubmitButton';
import { Card, CardSubtitle, CardHeader, CardFooter, CardBody,
    CardTitle, CardText } from 'reactstrap';
class Proposal extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            proposal: null,
            approved: 0,
            rejected: 0,
            executed: false,
            subscription: null
        }
    }

    componentDidMount() {
        this.load();
    }

    componentWillUnmount(){
        this.unsubscribeEvents();
    }

    subscribeEvents() {
        const {subscription, proposal} = this.state;
        const { proposalId, timestamp} = this.props;
        if(!proposal) return;
        const enableVote = timestamp && timestamp > proposal.startTime && timestamp < proposal.endTime;
        if(enableVote && !subscription){
            this.setState({
                subscription: MyGovernance.events.Vote({
                    filter: {proposalId}
                }, (error, event) => {
                    if(!error){
                        if(event.returnValues.approved){
                            this.setState({ approved: +this.state.approved + 1 })
                        } else {
                            this.setState({ rejected: +this.state.rejected + 1 })
                        }    
                    } else {
                        console.error(error)
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

    load() {
        const {proposalId, timestamp} = this.props;
        MyGovernance.methods.proposals(proposalId).call().then((proposal) => {
            if(proposal.startTime < timestamp){
                MyGovernance.methods.getVotes(proposalId).call().then((votes) => this.setState({approved: votes.approved,rejected: votes.rejected, executed: votes.executed})) //
                this.subscribeEvents();
            }
            this.setState({ proposal });
        })
    }
    componentDidUpdate(prevProps, prevState) {
        if (this.props.id != prevProps.id) {
            this.unsubscribeEvents();
            this.load();
        } else if (this.props.timestamp != prevProps.timestamp) {
            this.subscribeEvents();
        }
    }

    render() {
        const { proposalId, timestamp, defaultAccount} = this.props;
        const { proposal, approved, rejected, executed } = this.state;
        if(proposal){
            const enableVote = timestamp && timestamp > proposal.startTime && timestamp < proposal.endTime;
            const enableExecute = !executed && timestamp > proposal.endTime && approved > rejected;
            return(<Card>
                <CardBody>
                  <CardHeader>{approved} / {rejected}</CardHeader>
                  <CardTitle>Call: {proposal.proposalDestination}</CardTitle>
                  <CardSubtitle>Data: {proposal.proposalCalldata ? proposal.proposalCalldata : "0x" }</CardSubtitle>
                  <CardText>Contenthash: {proposal.contenthash ? proposal.contenthash : "0x"}</CardText>
                  <React.Fragment>
                            <TransactionSubmitButton 
                                account={defaultAccount}
                                text="Approve"
                                sendTransaction={
                                    MyGovernance.methods.vote(proposalId, true)
                                }
                                color="success"
                                disabled={!enableVote}
                                //icon={<IconExecute/>}
                                //onSubmission={(txHash) => this.handleSubmission(txHash) }
                                //onResult={(result) => this.handleResult(result) }
                                //onError={(error) => this.handleError(error) }
                                />
                            <TransactionSubmitButton 
                                account={defaultAccount}
                                text="Reject"
                                sendTransaction={
                                    MyGovernance.methods.vote(proposalId, false)
                                }
                                color="danger"  
                                disabled={!enableVote}                                  
                                />
                            <TransactionSubmitButton 
                                account={defaultAccount}
                                text="Execute"
                                sendTransaction={
                                    MyGovernance.methods.execute(proposalId)
                                }
                                color="primary"  
                                disabled={!enableExecute}                                  
                                />
                        </React.Fragment>
                  <CardFooter>{this.parseBlockTime(proposal.startTime)} : {this.parseBlockTime(proposal.endTime)} </CardFooter>
                </CardBody>
              </Card>)

         
        } else {
            return(<Card>
                <CardHeader>? / ?</CardHeader>
                <CardBody>
                  <CardTitle>Loading...</CardTitle>
                </CardBody>
                <CardFooter>? : ?</CardFooter>
              </Card>)
        }
        

    }

    parseBlockTime(blockTime){
        let d = new Date(blockTime*1000);
        return(d.toLocaleDateString() + " " + d.toLocaleTimeString())
    }
    
}

export default Proposal;