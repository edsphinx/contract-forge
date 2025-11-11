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
import { Category } from "contract_registry";
import { useNavigate } from "react-router-dom";
import {
  TransactionBuilder,
  Operation,
  rpc as StellarRpc,
  BASE_FEE,
} from "@stellar/stellar-sdk";
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
  const [localWasmHash, setLocalWasmHash] = useState<Uint8Array | null>(null);
  const [wasmInstalled, setWasmInstalled] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [installingWasm, setInstallingWasm] = useState(false);
  const [installProgress, setInstallProgress] = useState<{
    step: string;
    substep?: string;
    progress: number;
  } | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      console.log("No file selected");
      return;
    }

    console.log("File selected:", file.name);

    // Validate it's a .wasm file
    if (!file.name.endsWith(".wasm")) {
      addNotification("Please select a .wasm file", "error");
      return;
    }

    setFormData({ ...formData, wasmFile: file });

    // Calculate hash locally
    try {
      const arrayBuffer = await file.arrayBuffer();
      const hashArray = await crypto.subtle.digest("SHA-256", arrayBuffer);
      const hash = new Uint8Array(hashArray);
      const hashBuffer = Buffer.from(hash);

      console.log("Local WASM hash calculated:", hashBuffer.toString("hex"));
      setLocalWasmHash(hashBuffer);
      setWasmInstalled(false); // Reset installation status
      setWasmHash(null); // Clear network hash
      addNotification(
        "WASM file loaded. Click 'Install WASM on Network' to continue.",
        "primary",
      );
    } catch (error) {
      console.error("Failed to read WASM file:", error);
      addNotification("Failed to read WASM file", "error");
    }
  };

  const handleInstallWasm = async () => {
    if (!formData.wasmFile || !wallet.address || !wallet.signTransaction) {
      addNotification("Please select a WASM file and connect wallet", "error");
      return;
    }

    try {
      setInstallingWasm(true);
      setInstallProgress({
        step: "Initializing WASM installation...",
        progress: 10,
      });
      console.log("Starting WASM installation...");

      // Read WASM file
      setInstallProgress({ step: "Reading WASM file...", progress: 20 });
      const arrayBuffer = await formData.wasmFile.arrayBuffer();
      const wasmBuffer = Buffer.from(arrayBuffer);

      // Create server and get account
      setInstallProgress({
        step: "Connecting to Stellar network...",
        progress: 30,
      });
      const server = new StellarRpc.Server(
        import.meta.env.PUBLIC_STELLAR_RPC_URL,
        {
          allowHttp: import.meta.env.PUBLIC_STELLAR_RPC_URL.includes(
            "localhost",
          ),
        },
      );
      const account = await server.getAccount(wallet.address);
      console.log("Account fetched");

      // Create upload operation
      setInstallProgress({
        step: "Building upload transaction...",
        progress: 40,
      });
      const uploadOp = Operation.uploadContractWasm({
        wasm: wasmBuffer,
      });

      // Build transaction
      const transaction = new TransactionBuilder(account, {
        fee: BASE_FEE,
        networkPassphrase: import.meta.env.PUBLIC_STELLAR_NETWORK_PASSPHRASE,
      })
        .addOperation(uploadOp)
        .setTimeout(300)
        .build();

      console.log("Transaction built, preparing...");

      // Use prepareTransaction - this handles simulation and assembly
      setInstallProgress({ step: "Simulating transaction...", progress: 50 });
      const preparedTx = await server.prepareTransaction(transaction);
      console.log("Transaction prepared");

      // Sign with Freighter - stellar-wallets-kit returns { signedTxXdr: string }
      setInstallProgress({
        step: "Waiting for wallet signature...",
        substep: "Please approve in your wallet",
        progress: 60,
      });
      const { signedTxXdr } = await wallet.signTransaction(preparedTx.toXDR(), {
        networkPassphrase: import.meta.env.PUBLIC_STELLAR_NETWORK_PASSPHRASE,
      });
      console.log("Transaction signed, XDR length:", signedTxXdr.length);

      // Parse signed XDR
      const signedTransaction = TransactionBuilder.fromXDR(
        signedTxXdr,
        import.meta.env.PUBLIC_STELLAR_NETWORK_PASSPHRASE,
      );

      // Send
      setInstallProgress({ step: "Submitting to network...", progress: 70 });
      console.log("Sending transaction...");
      const result = await server.sendTransaction(signedTransaction);
      console.log("Transaction sent:", result.hash);

      if (result.status !== "PENDING") {
        throw new Error(`Transaction failed with status: ${result.status}`);
      }

      // Wait for confirmation
      let status = await server.getTransaction(result.hash);
      let attempts = 0;

      while (status.status === "NOT_FOUND" && attempts < 30) {
        console.log(`Waiting... attempt ${attempts + 1}/30`);
        const progressPercent = 70 + Math.min(25, (attempts / 30) * 25);
        setInstallProgress({
          step: "Waiting for confirmation...",
          substep: `Attempt ${attempts + 1}/30`,
          progress: progressPercent,
        });
        await new Promise((resolve) => setTimeout(resolve, 1000));
        status = await server.getTransaction(result.hash);
        attempts++;
      }

      console.log("Final status:", status.status);

      if (status.status === "SUCCESS") {
        const resultValue = status.returnValue;
        if (resultValue) {
          setInstallProgress({ step: "Finalizing...", progress: 95 });
          const hash = resultValue.bytes();
          const hashBuffer = Buffer.from(hash);
          console.log("WASM installed! Hash:", hashBuffer.toString("hex"));
          setWasmHash(hashBuffer);
          setWasmInstalled(true);
          setInstallProgress({
            step: "WASM installed successfully!",
            progress: 100,
          });
          await new Promise((resolve) => setTimeout(resolve, 1500));
          addNotification("WASM installed successfully!", "success");
        } else {
          throw new Error("No return value from transaction");
        }
      } else {
        throw new Error(`Transaction failed with status: ${status.status}`);
      }
    } catch (error) {
      console.error("Install failed:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      addNotification(`Failed to install WASM: ${errorMessage}`, "error");
    } finally {
      setInstallingWasm(false);
      setInstallProgress(null);
    }
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

    if (!wasmHash || !wasmInstalled) {
      addNotification(
        "Please install the WASM file on the network first",
        "error",
      );
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

      console.log(
        "Publishing with WASM hash:",
        Buffer.from(wasmHash).toString("hex"),
      );
      console.log("WASM hash length:", wasmHash.length);

      // Call publish_contract
      const tx = await registry.client.publish_contract({
        author: wallet.address,
        params: {
          wasm_hash: Buffer.from(wasmHash), // Convert Uint8Array to Buffer
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
      setLocalWasmHash(null);
      setWasmInstalled(false);

      // Redirect to marketplace after 2 seconds
      setTimeout(() => {
        navigate("/marketplace");
      }, 2000);
    } catch (error) {
      console.error("Publish failed:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
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
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., My Awesome Token"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">
                  <Text as="span" size="sm">
                    Description *
                  </Text>
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
                    <Text as="span" size="sm">
                      Category
                    </Text>
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
                    setFormData({
                      ...formData,
                      documentationUrl: e.target.value,
                    })
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
                  <Text as="span" size="sm">
                    Upload WASM File *
                  </Text>
                </label>
                <input
                  id="wasm"
                  type="file"
                  accept=".wasm"
                  onChange={handleFileChange}
                  className="file-input"
                  required
                  disabled={installingWasm}
                />

                {formData.wasmFile && localWasmHash && !wasmInstalled && (
                  <div className="file-info" style={{ marginTop: "1rem" }}>
                    <Text as="span" size="sm">
                      ✓ {formData.wasmFile.name} (
                      {(formData.wasmFile.size / 1024).toFixed(2)} KB) loaded
                    </Text>
                    <div style={{ marginTop: "0.5rem" }}>
                      <Button
                        variant="secondary"
                        size="md"
                        onClick={handleInstallWasm}
                        disabled={installingWasm}
                      >
                        {installingWasm ? (
                          <>
                            <Loader size="sm" />
                            Installing WASM on Network...
                          </>
                        ) : (
                          "Install WASM on Network"
                        )}
                      </Button>
                    </div>
                    <Text
                      as="p"
                      size="xs"
                      style={{ marginTop: "0.5rem", color: "#666" }}
                    >
                      You must install the WASM on Stellar network before
                      publishing
                    </Text>
                  </div>
                )}

                {formData.wasmFile && wasmInstalled && wasmHash && (
                  <div className="file-info" style={{ marginTop: "1rem" }}>
                    <Text as="span" size="sm" style={{ color: "green" }}>
                      ✓ {formData.wasmFile.name} (
                      {(formData.wasmFile.size / 1024).toFixed(2)} KB) - WASM
                      installed on network!
                    </Text>
                    <Text
                      as="p"
                      size="xs"
                      style={{ marginTop: "0.25rem", color: "#666" }}
                    >
                      Hash:{" "}
                      {Buffer.from(wasmHash).toString("hex").substring(0, 16)}
                      ...
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
              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={publishing || installingWasm || !wasmInstalled}
              >
                {publishing ? (
                  <>
                    <Loader size="sm" />
                    Publishing...
                  </>
                ) : !wasmInstalled ? (
                  "Install WASM First"
                ) : (
                  "Publish Contract"
                )}
              </Button>
            </div>
          </Card>
        </form>
      </div>

      {/* Full-screen progress overlay */}
      {installProgress && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.95)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            backdropFilter: "blur(10px)",
            animation: "fadeIn 0.3s ease",
          }}
        >
          <div
            style={{
              background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
              borderRadius: "24px",
              padding: "3.5rem 3rem",
              maxWidth: "550px",
              width: "90%",
              textAlign: "center",
              boxShadow:
                "0 25px 80px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)",
              border: "2px solid rgba(124, 58, 237, 0.3)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Gradient glow effect */}
            <div
              style={{
                position: "absolute",
                top: "-50%",
                left: "-50%",
                width: "200%",
                height: "200%",
                background:
                  "radial-gradient(circle, rgba(124, 58, 237, 0.15) 0%, transparent 70%)",
                animation: "pulse 3s ease-in-out infinite",
                pointerEvents: "none",
              }}
            />

            {/* Content */}
            <div style={{ position: "relative", zIndex: 1 }}>
              {/* Animated loader */}
              <div
                style={{
                  width: "100px",
                  height: "100px",
                  margin: "0 auto 2.5rem",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    border: "5px solid rgba(124, 58, 237, 0.2)",
                    borderTop: "5px solid #7c3aed",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    fontSize: "1.5rem",
                    fontWeight: "bold",
                    color: "#7c3aed",
                  }}
                >
                  {installProgress.progress}%
                </div>
              </div>

              {/* Progress bar */}
              <div
                style={{
                  width: "100%",
                  height: "12px",
                  backgroundColor: "rgba(124, 58, 237, 0.1)",
                  borderRadius: "8px",
                  overflow: "hidden",
                  marginBottom: "2rem",
                  border: "1px solid rgba(124, 58, 237, 0.2)",
                  boxShadow: "inset 0 2px 4px rgba(0, 0, 0, 0.3)",
                }}
              >
                <div
                  style={{
                    width: `${installProgress.progress}%`,
                    height: "100%",
                    background:
                      "linear-gradient(90deg, #7c3aed 0%, #a78bfa 100%)",
                    transition: "width 0.5s ease",
                    borderRadius: "8px",
                    boxShadow: "0 0 20px rgba(124, 58, 237, 0.6)",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background:
                        "linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.3) 50%, transparent 100%)",
                      animation: "shimmer 2s infinite",
                    }}
                  />
                </div>
              </div>

              {/* Progress text */}
              <Heading
                size="lg"
                as="h3"
                style={{
                  marginBottom: "0.75rem",
                  color: "#ffffff",
                  fontWeight: "600",
                  textShadow: "0 2px 10px rgba(124, 58, 237, 0.5)",
                }}
              >
                {installProgress.step}
              </Heading>
              {installProgress.substep && (
                <Text
                  as="p"
                  size="md"
                  style={{
                    color: "#a78bfa",
                    fontWeight: "500",
                    animation: "fadeIn 0.3s ease",
                  }}
                >
                  {installProgress.substep}
                </Text>
              )}

              {/* Info text */}
              <div
                style={{
                  marginTop: "2rem",
                  padding: "1rem",
                  backgroundColor: "rgba(124, 58, 237, 0.1)",
                  borderRadius: "12px",
                  border: "1px solid rgba(124, 58, 237, 0.2)",
                }}
              >
                <Text as="p" size="sm" style={{ color: "#cbd5e1", margin: 0 }}>
                  🔒 Please do not close this window or refresh the page
                </Text>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CSS for animations */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes pulse {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }

        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </Layout.Content>
  );
}
