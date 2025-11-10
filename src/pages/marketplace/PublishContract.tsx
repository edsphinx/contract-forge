import { useState } from "react";
import {
  Button,
  Card,
  Heading,
  Input,
  Textarea,
  Select,
  Text,
  Layout,
  Loader,
} from "@stellar/design-system";
import { useContractRegistry } from "../../hooks/useContractRegistry";
import { useWallet } from "../../hooks/useWallet";
import { useNotification } from "../../hooks/useNotification";
import { Category } from "contract-registry";
import { useNavigate } from "react-router-dom";
import "./PublishContract.css";

const CATEGORIES = [
  { value: Category.DeFi, label: "DeFi" },
  { value: Category.NFT, label: "NFT" },
  { value: Category.DAO, label: "DAO" },
  { value: Category.Gaming, label: "Gaming" },
  { value: Category.Utility, label: "Utility" },
  { value: Category.Oracle, label: "Oracle" },
  { value: Category.Other, label: "Other" },
];

export function PublishContract() {
  const wallet = useWallet();
  const registry = useContractRegistry();
  const { addNotification } = useNotification();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    version: "1.0.0",
    category: Category.Utility,
    sourceUrl: "",
    documentationUrl: "",
    license: "MIT",
    tags: "",
    wasmFile: null as File | null,
  });

  const [wasmHash, setWasmHash] = useState<Uint8Array | null>(null);
  const [publishing, setPublishing] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate it's a .wasm file
    if (!file.name.endsWith(".wasm")) {
      addNotification("Please select a .wasm file", "error");
      return;
    }

    setFormData({ ...formData, wasmFile: file });

    // Calculate hash (simplified - in production use proper crypto)
    const arrayBuffer = await file.arrayBuffer();
    const hashArray = await crypto.subtle.digest("SHA-256", arrayBuffer);
    const hash = new Uint8Array(hashArray);
    setWasmHash(hash);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!wallet.address) {
      addNotification("Please connect your wallet", "error");
      return;
    }

    if (!registry.client) {
      addNotification("Contract registry not ready", "error");
      return;
    }

    if (!wasmHash) {
      addNotification("Please select a WASM file", "error");
      return;
    }

    // Validate form
    if (!formData.name || !formData.description || !formData.sourceUrl) {
      addNotification("Please fill all required fields", "error");
      return;
    }

    try {
      setPublishing(true);

      // Parse tags
      const tags = formData.tags
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      // Call publish_contract
      const tx = await registry.client.publish_contract({
        author: wallet.address,
        params: {
          wasm_hash: Buffer.from(wasmHash),
          name: formData.name,
          description: formData.description,
          version: formData.version,
          category: formData.category,
          source_url: formData.sourceUrl,
          documentation_url: formData.documentationUrl,
          license: formData.license,
          tags: tags,
        },
      });

      // Sign and send transaction
      await tx.signAndSend();

      addNotification("Contract published successfully!", "success");

      // Reset form
      setFormData({
        name: "",
        description: "",
        version: "1.0.0",
        category: Category.Utility,
        sourceUrl: "",
        documentationUrl: "",
        license: "MIT",
        tags: "",
        wasmFile: null,
      });
      setWasmHash(null);

      // Redirect to marketplace after 2 seconds
      setTimeout(() => {
        navigate("/marketplace");
      }, 2000);
    } catch (error) {
      console.error("Publish failed:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      addNotification(`Failed to publish: ${errorMessage}`, "error");
    } finally {
      setPublishing(false);
    }
  };

  if (!wallet.address) {
    return (
      <Layout.Content>
        <div className="publish-container">
          <div className="connect-prompt">
            <Card>
              <Heading size="lg" as="h2">
                Connect Your Wallet
              </Heading>
              <Text as="p" size="md">
                Please connect your wallet to publish contracts.
              </Text>
            </Card>
          </div>
        </div>
      </Layout.Content>
    );
  }

  return (
    <Layout.Content>
      <div className="publish-container">
        <header className="publish-header">
          <Heading size="xl" as="h1">
            Publish Contract
          </Heading>
          <Text as="p" size="lg">
            Share your smart contract with the community
          </Text>
        </header>

        <form onSubmit={handleSubmit} className="publish-form">
          <Card>
            <div className="form-section">
              <Heading size="md" as="h3">
                Contract Details
              </Heading>

              <div className="form-group">
                <Input
                  id="name"
                  label="Contract Name *"
                  fieldSize="md"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., My Awesome Token"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">
                  <Text as="span" size="sm">Description *</Text>
                </label>
                <Textarea
                  id="description"
                  fieldSize="md"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Describe what your contract does..."
                  rows={4}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <Input
                    id="version"
                    label="Version"
                    fieldSize="md"
                    value={formData.version}
                    onChange={(e) =>
                      setFormData({ ...formData, version: e.target.value })
                    }
                    placeholder="1.0.0"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="category">
                    <Text as="span" size="sm">Category</Text>
                  </label>
                  <Select
                    id="category"
                    fieldSize="md"
                    value={formData.category.toString()}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        category: parseInt(e.target.value) as Category,
                      })
                    }
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

              <div className="form-group">
                <Input
                  id="sourceUrl"
                  label="Source Code URL *"
                  fieldSize="md"
                  type="url"
                  value={formData.sourceUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, sourceUrl: e.target.value })
                  }
                  placeholder="https://github.com/yourname/contract"
                  required
                />
              </div>

              <div className="form-group">
                <Input
                  id="documentationUrl"
                  label="Documentation URL"
                  fieldSize="md"
                  type="url"
                  value={formData.documentationUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, documentationUrl: e.target.value })
                  }
                  placeholder="https://docs.yourproject.com"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <Input
                    id="license"
                    label="License"
                    fieldSize="md"
                    value={formData.license}
                    onChange={(e) =>
                      setFormData({ ...formData, license: e.target.value })
                    }
                    placeholder="MIT"
                  />
                </div>

                <div className="form-group">
                  <Input
                    id="tags"
                    label="Tags (comma-separated)"
                    fieldSize="md"
                    value={formData.tags}
                    onChange={(e) =>
                      setFormData({ ...formData, tags: e.target.value })
                    }
                    placeholder="defi, token, swap"
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <Heading size="md" as="h3">
                WASM Binary
              </Heading>

              <div className="form-group">
                <label htmlFor="wasm">
                  <Text as="span" size="sm">Upload WASM File *</Text>
                </label>
                <input
                  id="wasm"
                  type="file"
                  accept=".wasm"
                  onChange={handleFileChange}
                  className="file-input"
                  required
                />
                {formData.wasmFile && (
                  <div className="file-info">
                    <Text as="span" size="sm">
                      ✓ {formData.wasmFile.name} (
                      {(formData.wasmFile.size / 1024).toFixed(2)} KB)
                    </Text>
                  </div>
                )}
              </div>
            </div>

            <div className="form-actions">
              <Button
                type="button"
                variant="secondary"
                size="md"
                onClick={() => navigate("/marketplace")}
                disabled={publishing}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="md" disabled={publishing}>
                {publishing ? (
                  <>
                    <Loader size="sm" />
                    Publishing...
                  </>
                ) : (
                  "Publish Contract"
                )}
              </Button>
            </div>
          </Card>
        </form>
      </div>
    </Layout.Content>
  );
}
