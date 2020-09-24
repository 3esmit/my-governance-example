pragma solidity ^0.6.0;

/**
 * @author MyName
 * @title My Governance
 * @notice An example of a governance contract
 * @dev Unsafe contract! Do not use in production!
 */
contract MyGovernance {
    event NewProposal(uint256 indexed proposalId, address proposalDestination, bytes proposalCalldata, uint256 startTime, uint256 endTime, bytes contenthash);
    event Vote(uint256 indexed proposalId, bool approved);
    event Executed(uint256 indexed proposalId, bool result, bytes returndata);
    struct Proposal {
        address proposalDestination;
        bytes proposalCalldata;
        uint256 startTime;
        uint256 endTime;
        bytes contenthash;
    }
    struct Ballot {
        uint256 approved;
        uint256 rejected;
        bool executed;
    }

    Proposal[] public proposals;
    mapping(uint256 => Ballot) ballots;

    /**
     * @notice Creates a new proposal
     * @param _proposalDestination Contract to call on approval
     * @param _proposalCalldata Call to be made on approval
     * @param _startTime Vote period start timestamp
     * @param _endTime Vote period end timestamp
     * @param _contenthash description URI encoded in Contenthash format
     */
    function createProposal(address _proposalDestination, bytes calldata _proposalCalldata, uint256 _startTime, uint256 _endTime, bytes calldata _contenthash) external {
        require(_startTime < _endTime, "Vote period is negative");
        require(_endTime-_startTime > 7 days, "Vote period is too small");
        require(block.timestamp < _startTime, "Start time is in past");
        proposals.push(Proposal(_proposalDestination, _proposalCalldata, _startTime, _endTime, _contenthash));
        emit NewProposal(proposals.length-1, _proposalDestination, _proposalCalldata, _startTime, _endTime, _contenthash);
    }

    /**
     * @notice Votes in a proposal
     * @param _proposalId proposal index
     * @param _approval true for approved, false for rejected
     */
    function vote(uint256 _proposalId, bool _approval) external {
        //TODO: ensure accounts can't vote twice
        require(proposals.length > _proposalId, "Invalid proposal");
        require(block.timestamp >= proposals[_proposalId].startTime, "Vote period is in future");
        require(block.timestamp < proposals[_proposalId].endTime, "Vote period is in past");
        if(_approval){
            ballots[_proposalId].approved++;
        } else {
            ballots[_proposalId].rejected++;
        }
        emit Vote(_proposalId, _approval);
    }

    /**
     * @notice Executes an approved proposal
     * @param _proposalId proposal index
     */
    function execute(uint256 _proposalId) external {
        require(result(_proposalId), "Proposal rejected");
        require(!ballots[_proposalId].executed, "Proposal already executed");
        ballots[_proposalId].executed = true;
        (bool result, bytes memory returndata) = proposals[_proposalId].proposalDestination.call(proposals[_proposalId].proposalCalldata);
        emit Executed(_proposalId, result, returndata);
    }

    /**
     * @notice Calculates the result of a proposal
     * @param _proposalId proposal index
     * @return res true for approved, false for rejected
     */
    function result(uint256 _proposalId) public view returns(bool res) {
        require(block.timestamp >= proposals[_proposalId].endTime, "Vote period is not in past");
        res = ballots[_proposalId].approved > ballots[_proposalId].rejected;
    }

    function totalProposals() public view returns(uint256 total){
        return proposals.length;
    }
}
