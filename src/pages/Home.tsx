import React from "react";
import { Code, Layout, Text, Button } from "@stellar/design-system";
import { useNavigate } from "react-router-dom";

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Layout.Content>
      <Layout.Inset>
        <Text as="h1" size="xl">
          Welcome to ContractForge
        </Text>
        <Text as="p" size="md">
          A decentralized marketplace and registry for Stellar Soroban smart contracts.
          Discover, publish, deploy, and review smart contracts with ease.
        </Text>

        <Text as="h2" size="lg">
          Features
        </Text>
        <Text as="p" size="md">
          <strong>📦 Contract Registry:</strong> Browse and discover verified smart contracts
          published by the community.
        </Text>
        <Text as="p" size="md">
          <strong>🚀 One-Click Deployment:</strong> Deploy any contract from the registry
          to your account with a simple wizard.
        </Text>
        <Text as="p" size="md">
          <strong>⭐ Reviews & Ratings:</strong> Community-driven reviews help you find
          trusted, high-quality contracts.
        </Text>
        <Text as="p" size="md">
          <strong>📊 Deployment History:</strong> Track all your deployed contracts
          and manage them from one place.
        </Text>

        <Text as="h2" size="lg">
          Get Started
        </Text>
        <Text as="p" size="md">
          Connect your Stellar wallet to start exploring the marketplace, publish
          your own contracts, or deploy existing ones.
        </Text>

        <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
          <Button
            variant="primary"
            size="md"
            onClick={() => navigate("/marketplace")}
          >
            Browse Marketplace
          </Button>
          <Button
            variant="secondary"
            size="md"
            onClick={() => navigate("/publish")}
          >
            Publish Contract
          </Button>
        </div>

        <Text as="h2" size="lg">
          For Developers
        </Text>
        <Text as="p" size="md">
          This project includes three smart contracts built with Soroban:
        </Text>
        <Text as="p" size="md">
          • <Code size="md">contract-registry</Code> - Core marketplace registry
        </Text>
        <Text as="p" size="md">
          • <Code size="md">deployment-manager</Code> - Handles one-click deployments
        </Text>
        <Text as="p" size="md">
          • <Code size="md">review-system</Code> - Community reviews and ratings
        </Text>
        <Text as="p" size="md">
          Explore the <Code size="md">&lt;/&gt; Debugger</Code> to interact with
          contracts directly during development.
        </Text>
      </Layout.Inset>
    </Layout.Content>
  );
};

export default Home;
