import pc from "picocolors";

export const logger = {
  title(message: string): void {
    console.log(`\n${pc.bold(message)}\n`);
  },
  info(message: string): void {
    console.log(pc.cyan(message));
  },
  success(message: string): void {
    console.log(pc.green(`✓ ${message}`));
  },
  skip(message: string): void {
    console.log(pc.yellow(`○ ${message}`));
  },
  warn(message: string): void {
    console.log(pc.yellow(`! ${message}`));
  },
  error(message: string): void {
    console.error(pc.red(`✗ ${message}`));
  },
  muted(message: string): void {
    console.log(pc.dim(message));
  },
  plain(message: string): void {
    console.log(message);
  },
};
