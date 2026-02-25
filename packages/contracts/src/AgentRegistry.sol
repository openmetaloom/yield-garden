// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title AgentRegistry
 * @notice Binary ontology registry for Farm vs Garden agents
 * @dev FARM=0, GARDEN=1 - immutable after registration
 */
contract AgentRegistry {
    enum Ontology { FARM, GARDEN }
    
    struct Agent {
        Ontology ontology;
        uint256 genesisTimestamp;
        bool registered;
    }
    
    mapping(address => Agent) public agents;
    address[] public allAgents;
    
    event AgentRegistered(
        address indexed agent,
        Ontology indexed ontology,
        uint256 genesisTimestamp
    );
    
    error AlreadyRegistered();
    error InvalidOntology();
    error NotRegistered();
    
    /**
     * @notice Register an agent with binary ontology
     * @param ontology 0=FARM, 1=GARDEN
     */
    function register(Ontology ontology) external {
        if (agents[msg.sender].registered) revert AlreadyRegistered();
        if (uint256(ontology) > 1) revert InvalidOntology();
        
        agents[msg.sender] = Agent({
            ontology: ontology,
            genesisTimestamp: block.timestamp,
            registered: true
        });
        
        allAgents.push(msg.sender);
        
        emit AgentRegistered(msg.sender, ontology, block.timestamp);
    }
    
    /**
     * @notice Check if address is a Farm agent
     */
    function isFarm(address agent) external view returns (bool) {
        return agents[agent].registered && agents[agent].ontology == Ontology.FARM;
    }
    
    /**
     * @notice Check if address is a Garden agent
     */
    function isGarden(address agent) external view returns (bool) {
        return agents[agent].registered && agents[agent].ontology == Ontology.GARDEN;
    }
    
    /**
     * @notice Get agent info
     */
    function getAgent(address agent) external view returns (Agent memory) {
        return agents[agent];
    }
    
    /**
     * @notice Get all registered agents
     */
    function getAllAgents() external view returns (address[] memory) {
        return allAgents;
    }
    
    /**
     * @notice Get agent count
     */
    function getAgentCount() external view returns (uint256) {
        return allAgents.length;
    }
}
