import React from "react";
import { Layout, Text, Button, Card, Icon } from "@stellar/design-system";
import { useNavigate } from "react-router-dom";
import "./Home.css";

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Layout.Content>
      <div className="home-container">
        {/* Hero Section */}
        <div className="hero-section">
          <div className="hero-content">
            <Text as="h1" size="xl" className="hero-title">
              ContractForge
            </Text>
            <Text as="p" size="lg" className="hero-subtitle">
              The NPM for Stellar Smart Contracts
            </Text>
            <Text as="p" size="md" className="hero-description">
              Discover, publish, and deploy verified Soroban contracts with one
              click
            </Text>
            <div className="hero-actions">
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate("/marketplace")}
              >
                <Icon.Package size="md" />
                Explore Marketplace
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => navigate("/publish")}
              >
                <Icon.Upload01 size="md" />
                Publish Contract
              </Button>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="features-grid">
          <div className="feature-card">
            <Card>
              <div className="feature-icon">
                <Icon.Package size="xl" />
              </div>
              <Text as="h3" size="md" className="feature-title">
                Contract Registry
              </Text>
              <Text as="p" size="sm" className="feature-description">
                Browse verified smart contracts published by the community
              </Text>
            </Card>
          </div>

          <div className="feature-card">
            <Card>
              <div className="feature-icon">
                <Icon.Rocket01 size="xl" />
              </div>
              <Text as="h3" size="md" className="feature-title">
                One-Click Deploy
              </Text>
              <Text as="p" size="sm" className="feature-description">
                Deploy any contract instantly with our deployment wizard
              </Text>
            </Card>
          </div>

          <div className="feature-card">
            <Card>
              <div className="feature-icon">
                <Icon.Star01 size="xl" />
              </div>
              <Text as="h3" size="md" className="feature-title">
                Reviews & Ratings
              </Text>
              <Text as="p" size="sm" className="feature-description">
                Community-driven reviews for trusted, quality contracts
              </Text>
            </Card>
          </div>

          <div className="feature-card">
            <Card>
              <div className="feature-icon">
                <Icon.ClockFastForward size="xl" />
              </div>
              <Text as="h3" size="md" className="feature-title">
                Deployment History
              </Text>
              <Text as="p" size="sm" className="feature-description">
                Track and manage all your deployed contracts in one place
              </Text>
            </Card>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="stats-section">
          <div className="stats-card">
            <Card>
              <div className="stat-item">
                <Icon.CheckCircle size="lg" className="stat-icon" />
                <div className="stat-content">
                  <Text as="span" size="xs" className="stat-label">
                    Built with
                  </Text>
                  <Text as="span" size="sm" className="stat-value">
                    Scaffold Stellar
                  </Text>
                </div>
              </div>
              <div className="stat-item">
                <Icon.Globe02 size="lg" className="stat-icon" />
                <div className="stat-content">
                  <Text as="span" size="xs" className="stat-label">
                    Deployed on
                  </Text>
                  <Text as="span" size="sm" className="stat-value">
                    Stellar Testnet
                  </Text>
                </div>
              </div>
              <div className="stat-item">
                <Icon.Code01 size="lg" className="stat-icon" />
                <div className="stat-content">
                  <Text as="span" size="xs" className="stat-label">
                    Powered by
                  </Text>
                  <Text as="span" size="sm" className="stat-value">
                    Soroban Smart Contracts
                  </Text>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </Layout.Content>
  );
};

export default Home;
