// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.27;

interface IDappCoin {
    function totalSupply() external view returns (uint256);

    function balanceOf(address account) external view returns (uint256);

    function allowance(
        address owner,
        address delegate
    ) external view returns (uint256);

    function transfer(
        address recipient,
        uint256 amount
    ) external returns (bool);

    function approve(address delegate, uint256 amount) external returns (bool);

    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) external returns (bool);

    event Transfer(address indexed from, address indexed to, uint256 amount);

    event Approval(address indexed from, address indexed to, uint256 amount);
}

contract DappCoin is IDappCoin {
    using SafeMath for uint256;

    string public constant name = "Dapp Caoin";
    string public constant symbol = "DC";
    uint public constant decimals = 18;

    mapping(address => uint) balances;
    mapping(address => mapping(address => uint)) allowed;
    uint _totalSupply;

    constructor(uint256 initialSupply) {
        _totalSupply = initialSupply;
        balances[msg.sender] = _totalSupply;
    }

    function totalSupply() public view override returns (uint256) {
        return _totalSupply;
    }

    function increaseTotalSupply(uint newTokensAmount) public {
        _totalSupply = _totalSupply.add(newTokensAmount);
        balances[msg.sender] = balances[msg.sender].add(newTokensAmount);
    }

    function balanceOf(
        address tokenOwner
    ) public view override returns (uint256) {
        return balances[tokenOwner];
    }

    function allowance(
        address owner,
        address delegate
    ) public view override returns (uint256) {
        return allowed[owner][delegate];
    }

    function transfer(
        address recipient,
        uint256 tokens
    ) public override returns (bool) {
        require(tokens <= balances[msg.sender], "Insufficient funds");

        balances[msg.sender] = balances[msg.sender].sub(tokens);
        balances[recipient] = balances[recipient].add(tokens);

        emit Transfer(msg.sender, recipient, tokens);
        return true;
    }

    function approve(
        address delegate,
        uint256 tokens
    ) public override returns (bool) {
        allowed[msg.sender][delegate] = tokens;

        emit Approval(msg.sender, delegate, tokens);
        return true;
    }

    function transferFrom(
        address owner,
        address recipient,
        uint256 tokens
    ) public override returns (bool) {
        require(tokens <= balances[owner], "Insufficient funds");
        require(tokens <= allowed[owner][msg.sender], "Allowance exceeded");

        balances[owner] = balances[owner].sub(tokens);
        allowed[owner][msg.sender] = allowed[owner][msg.sender].sub(tokens);
        balances[recipient] = balances[recipient].add(tokens);

        emit Transfer(owner, recipient, tokens);
        return true;
    }
}

library SafeMath {
    function sub(uint256 a, uint256 b) internal pure returns (uint256) {
        assert(b <= a);

        return a - b;
    }

    function add(uint256 a, uint256 b) internal pure returns (uint256) {
        uint256 c = a + b;
        assert(c >= a);

        return a + b;
    }

    function mul(uint256 a, uint256 b) internal pure returns (uint256) {
        if (a == 0) {
            return a;
        }

        uint256 c = a * b;
        require(c / a == b, "SafeMath: multiplication overflow");

        return c;
    }
}
