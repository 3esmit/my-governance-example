import React from 'react';
import MyGovernance from '../../embarkArtifacts/contracts/MyGovernance';

class Proposal extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            proposal: null,
        }
    }

    componentDidMount() {
        this.load();
    }
    load() {
        MyGovernance.methods.proposals(this.props.proposalId).call().then((proposal) => {
            console.log(proposal)
            this.setState({ proposal });
        })
    }
    componentDidUpdate(prevProps, prevState) {
        if (this.props.id != prevProps.id) {
            this.load();
        }
    }

    render() {
        const { id} = this.props;
        const { proposal } = this.state;
        return (
            !proposal ?
                (<li>loading</li>) :
                (<li>{proposal.proposalDestination} - {proposal.proposalCalldata ? proposal.proposalCalldata : "0x" } - {proposal.startTime} - {proposal.endTime} - {proposal.contenthash ? proposal.contenthash : "0x"}</li>)
        )

    }
}

export default Proposal;