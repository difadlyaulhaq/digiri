pragma solidity ^0.8.20;
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title BatikGiriloyoNFT
 * @dev NFT Certificate untuk Batik Giriloyo - FIXED VERSION
 * @notice Tidak menggunakan Counters library (deprecated di OZ v5)
 */
contract BatikGiriloyoNFT is ERC721, ERC721URIStorage, ERC721Enumerable, Ownable {
    // ✅ FIXED: Gunakan uint256 biasa instead of Counters
    uint256 private _tokenIdCounter;

    // Base URI untuk metadata
    string private _baseTokenURI;
    
    // Royalty info (untuk OpenSea)
    address public royaltyReceiver;
    uint96 public royaltyPercentage = 250; // 2.5% dalam basis points (10000 = 100%)

    // Mapping untuk menyimpan order ID ke token ID
    mapping(string => uint256) public orderToToken;
    mapping(uint256 => string) public tokenToOrder;
    
    // Mapping untuk track custodial wallets
    mapping(address => string) public walletToEmail;

    // Events
    event NFTMinted(
        uint256 indexed tokenId,
        address indexed recipient,
        string orderId,
        string tokenURI
    );
    
    event RoyaltyUpdated(address receiver, uint96 percentage);

    // ✅ FIXED: Constructor untuk Ownable di OZ v5
    constructor(address initialOwner) 
        ERC721("Batik Giriloyo Certificate", "BATIK")
        Ownable(initialOwner)
    {
        royaltyReceiver = initialOwner;
        _tokenIdCounter = 0; // Start dari 0
    }

    // Mint NFT dengan metadata URI
    function mintNFT(
        address recipient,
        string memory orderId,
        string memory uri
    ) public onlyOwner returns (uint256) {
        // ✅ FIXED: Increment secara manual
        _tokenIdCounter++;
        uint256 newTokenId = _tokenIdCounter;

        _safeMint(recipient, newTokenId);
        _setTokenURI(newTokenId, uri);

        // Simpan mapping
        orderToToken[orderId] = newTokenId;
        tokenToOrder[newTokenId] = orderId;

        emit NFTMinted(newTokenId, recipient, orderId, uri);

        return newTokenId;
    }

    // Batch mint untuk multiple NFTs
    function batchMintNFT(
        address[] memory recipients,
        string[] memory orderIds,
        string[] memory tokenURIs
    ) public onlyOwner returns (uint256[] memory) {
        require(
            recipients.length == orderIds.length && 
            orderIds.length == tokenURIs.length,
            "Array lengths must match"
        );

        uint256[] memory tokenIds = new uint256[](recipients.length);

        for (uint256 i = 0; i < recipients.length; i++) {
            tokenIds[i] = mintNFT(recipients[i], orderIds[i], tokenURIs[i]);
        }

        return tokenIds;
    }

    // Set base URI untuk collection
    function setBaseURI(string memory baseURI) public onlyOwner {
        _baseTokenURI = baseURI;
    }

    // Override _baseURI untuk OpenSea
    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

    // Contract URI untuk OpenSea collection metadata
    function contractURI() public view returns (string memory) {
        return string(abi.encodePacked(_baseURI(), "collection.json"));
    }

    // Royalty info sesuai EIP-2981 (OpenSea standard)
    function royaltyInfo(uint256, uint256 salePrice)
        external
        view
        returns (address receiver, uint256 royaltyAmount)
    {
        receiver = royaltyReceiver;
        royaltyAmount = (salePrice * royaltyPercentage) / 10000;
    }

    // Update royalty settings
    function setRoyalty(address receiver, uint96 percentage) public onlyOwner {
        require(percentage <= 1000, "Royalty too high"); // Max 10%
        royaltyReceiver = receiver;
        royaltyPercentage = percentage;
        emit RoyaltyUpdated(receiver, percentage);
    }

    // Register custodial wallet dengan email
    function registerWallet(address wallet, string memory email) public onlyOwner {
        walletToEmail[wallet] = email;
    }

    // Get total minted NFTs
    // ✅ FIXED: Override totalSupply dari ERC721Enumerable
    function totalSupply() public view override(ERC721Enumerable) returns (uint256) {
        return _tokenIdCounter;
    }

    // Get token ID by order ID
    function getTokenByOrder(string memory orderId) 
        public 
        view 
        returns (uint256) 
    {
        return orderToToken[orderId];
    }

    // ============================================
    // Required Overrides
    // ============================================

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    // ✅ FIXED: Update untuk OZ v5 - hanya 3 parameters
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override(ERC721, ERC721Enumerable) returns (address) {
        return super._update(to, tokenId, auth);
    }

    // ✅ FIXED: Ganti _beforeTokenTransfer dengan _increaseBalance
    function _increaseBalance(address account, uint128 value)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._increaseBalance(account, value);
    }

    function _burn(uint256 tokenId) 
        internal 
        override(ERC721, ERC721URIStorage) 
    {
        super._burn(tokenId);
    }
}