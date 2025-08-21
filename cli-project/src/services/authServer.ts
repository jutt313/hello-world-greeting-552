
import express from 'express';
import { Server } from 'http';
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import { CONFIG } from '../config/config';

export class AuthServer {
  private app: express.Application;
  private server: Server | null = null;
  private resolveAuth: ((token: string) => void) | null = null;
  private rejectAuth: ((error: Error) => void) | null = null;

  constructor() {
    this.app = express();
    this.setupRoutes();
  }

  private setupRoutes() {
    // Handle the CLI authentication callback
    this.app.get('/auth/callback', async (req, res) => {
      try {
        const { token, error } = req.query;

        if (error) {
          console.error(chalk.red('❌ Authentication failed:'), error);
          res.send(`
            <html>
              <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                <h2 style="color: #ef4444;">Authentication Failed</h2>
                <p>Error: ${error}</p>
                <p>You can close this window and try again.</p>
              </body>
            </html>
          `);
          if (this.rejectAuth) {
            this.rejectAuth(new Error(error as string));
          }
          return;
        }

        if (!token) {
          const errorMsg = 'No authentication token received';
          console.error(chalk.red('❌ Authentication failed:'), errorMsg);
          res.send(`
            <html>
              <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                <h2 style="color: #ef4444;">Authentication Failed</h2>
                <p>No token received from the authentication process.</p>
                <p>You can close this window and try again.</p>
              </body>
            </html>
          `);
          if (this.rejectAuth) {
            this.rejectAuth(new Error(errorMsg));
          }
          return;
        }

        // Save the token
        const tokenPath = path.join(process.cwd(), CONFIG.AUTH_TOKEN_FILE);
        await fs.writeFile(tokenPath, token as string);

        // Send success response
        res.send(`
          <html>
            <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
              <h2 style="color: #22c55e;">✅ Authentication Successful!</h2>
              <p>You have successfully authenticated with Code-XI.</p>
              <p><strong>You can now close this window and return to your terminal.</strong></p>
              <script>
                setTimeout(() => {
                  window.close();
                }, 2000);
              </script>
            </body>
          </html>
        `);

        // Resolve the authentication promise
        if (this.resolveAuth) {
          this.resolveAuth(token as string);
        }

        // Close the server after successful authentication
        setTimeout(() => {
          this.close();
        }, 1000);

      } catch (error) {
        console.error(chalk.red('❌ Server error:'), error);
        res.status(500).send(`
          <html>
            <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
              <h2 style="color: #ef4444;">Server Error</h2>
              <p>An error occurred during authentication.</p>
              <p>You can close this window and try again.</p>
            </body>
          </html>
        `);
        if (this.rejectAuth) {
          this.rejectAuth(new Error('Server error during authentication'));
        }
      }
    });

    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.json({ status: 'ok', message: 'CLI Auth Server is running' });
    });
  }

  public start(): Promise<string> {
    return new Promise((resolve, reject) => {
      this.resolveAuth = resolve;
      this.rejectAuth = reject;

      this.server = this.app.listen(CONFIG.CLI_AUTH_PORT, 'localhost', () => {
        console.log(chalk.blue(`🔐 CLI Auth Server started on http://localhost:${CONFIG.CLI_AUTH_PORT}`));
      });

      this.server.on('error', (error: any) => {
        if (error.code === 'EADDRINUSE') {
          console.error(chalk.red(`❌ Port ${CONFIG.CLI_AUTH_PORT} is already in use. Please close any applications using this port and try again.`));
          reject(new Error(`Port ${CONFIG.CLI_AUTH_PORT} is already in use`));
        } else {
          console.error(chalk.red('❌ Server start error:'), error);
          reject(error);
        }
      });

      // Set a timeout for authentication
      setTimeout(() => {
        if (this.server?.listening) {
          this.close();
          reject(new Error('Authentication timeout - no response received within 5 minutes'));
        }
      }, 5 * 60 * 1000); // 5 minutes timeout
    });
  }

  public close() {
    if (this.server) {
      this.server.close(() => {
        console.log(chalk.gray('🔐 CLI Auth Server stopped'));
      });
      this.server = null;
    }
  }
}
