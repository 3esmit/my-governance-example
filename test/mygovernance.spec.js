const MyGovernance = artifacts.require('MyGovernance');
const {
  BN,           // Big Number support
  time,         // Time operations
  constants,    // Common constants, like the zero address and largest integers
  expectEvent,  // Assertions for emitted events
  expectRevert, // Assertions for transactions that should fail
} = require('@openzeppelin/test-helpers');

let accounts;
config({
  contracts: {
    deploy: { 
      "MyGovernance": {}
    }
  }
}, (_err, web3_accounts) => {
  accounts = web3_accounts
});

contract("MyGovernance", function () {
  it("any/all address can't create a past proposal", async function () {
    const proposalCalldata = "0x";
    const proposalDestination = constants.ZERO_ADDRESS;
    const startTime = (await time.latest()).sub(time.duration.weeks(1));
    const endTime = startTime.add(time.duration.weeks(2));
    const contenthash = "0x";
    await expectRevert(
      MyGovernance.methods.createProposal(proposalDestination, proposalCalldata, startTime, endTime, contenthash).send(),
      "Start time is in past"
    ); 
  });

  it("any/all address can't create an proposal with invalid period", async function () {
    const proposalCalldata = "0x";
    const proposalDestination = constants.ZERO_ADDRESS;
    const startTime = (await time.latest()).add(time.duration.weeks(1));
    const endTime = startTime.sub(time.duration.weeks(2));
    const contenthash = "0x";
    await expectRevert(
      MyGovernance.methods.createProposal(proposalDestination, proposalCalldata, startTime, endTime, contenthash).send(),
      "revert Vote period is negative"
    );
  });

  it("any/all address can create a future proposal", async function () {
    const proposalId = await MyGovernance.methods.totalProposals().call();
    const proposalCalldata = "0x";
    const proposalDestination = constants.ZERO_ADDRESS;
    const startTime = (await time.latest()).add(time.duration.weeks(1));
    const endTime = startTime.add(time.duration.weeks(2));
    const contenthash = "0x";
    const result = await MyGovernance.methods.createProposal(proposalDestination, proposalCalldata, startTime, endTime, contenthash).send(); 
    expectEvent(
      result, 
      'NewProposal', {
        proposalId,
        proposalDestination,
        proposalCalldata: null,
        startTime,
        endTime,
        contenthash: null
      }
    );
    const readProposal = await MyGovernance.methods.proposals(proposalId).call();
    assert(readProposal.proposalDestination == proposalDestination)
    assert(readProposal.proposalCalldata == null)
    assert(readProposal.startTime == startTime)
    assert(readProposal.endTime == endTime)
    assert(readProposal.contenthash == null)
  });

  it("any/all address can't vote in invalid proposalId", async function() {
    const nextProposalId = new BN(await MyGovernance.methods.totalProposals().call());
    await expectRevert(
      MyGovernance.methods.vote(nextProposalId,true).send(),
      "Invalid proposal"
    );
  });

  it("any/all address can't vote before voting period", async function() {
    const lastProposalId = await MyGovernance.methods.totalProposals().call()-1;
    await expectRevert(
      MyGovernance.methods.vote(lastProposalId,true).send(),
      "Vote period is in future"
    );
  });

  it("any/all address can vote during vote period", async function() {
    const proposalId = await MyGovernance.methods.totalProposals().call()-1;
    const approved = true;
    const readProposal = await MyGovernance.methods.proposals(proposalId).call();
    await time.increaseTo(readProposal.startTime);
    const result = await MyGovernance.methods.vote(proposalId,approved).send();
    expectEvent(result, 'Vote', {
      proposalId: proposalId+'',
      approved
    });
  });

  it("any/all address can't execute while in voting period", async function() {
    const proposalId = await MyGovernance.methods.totalProposals().call()-1;
    expectRevert(
      MyGovernance.methods.execute(proposalId).send(),
      "Vote period is not in past"
    );
  });

  it("any/all address can't vote after voting period", async function() {
    const lastProposalId = await MyGovernance.methods.totalProposals().call()-1;
    const readProposal = await MyGovernance.methods.proposals(lastProposalId).call();
    await time.increaseTo(readProposal.endTime);
    await expectRevert(
      MyGovernance.methods.vote(lastProposalId,true).send(),
      "Vote period is in past"
    );
  });

  it("any/all address can execute an approved proposal", async function() {
    const proposalId = await MyGovernance.methods.totalProposals().call()-1;
    const result = await MyGovernance.methods.execute(proposalId).send();
    expectEvent(result, 'Executed', {
      proposalId: proposalId+''
    });
  });

  it("any/all address can't execute a rejected proposal", async function() {
    const proposalCalldata = "0x";
    const proposalDestination = constants.ZERO_ADDRESS;
    const startTime = (await time.latest()).add(time.duration.weeks(1));
    const endTime = startTime.add(time.duration.weeks(2));
    const contenthash = "0x";
    const result = await MyGovernance.methods.createProposal(proposalDestination, proposalCalldata, startTime, endTime, contenthash).send(); 
    await time.increaseTo(startTime);
    const proposalId = result.events.NewProposal.returnValues.proposalId;
    const approved = false;
    await MyGovernance.methods.vote(proposalId,approved).send();
    await time.increaseTo(endTime);
    await expectRevert(
      MyGovernance.methods.execute(proposalId).send(),
      "Proposal rejected"
    );
  });
});

