import { exec } from "child_process"
import { promisify } from "util";
import path from 'path';
import fs from 'fs-extra';

const execAsync = promisify(exec);

export class Utilities {
  /**
   * Copies one or more files/directories into a destination folder.
   * 
   * @param {string} dest - Destination directory path.
   * @param {...string} files - One or more file or folder paths to copy.
   * @returns {Promise<Array<{ source: string, destination: string }>>} List of copied files with their destinations.
   */
  static async copy(dest, ...files) {
    const results = [];

    for (const file of files) {
      const target = path.join(dest, path.basename(file));
      await fs.copy(file, target);
      results.push({ source: file, destination: target });
    }

    return results;
  }

  /**
   * Moves one or more files/directories into a destination folder.
   * 
   * @param {string} dest - Destination directory path.
   * @param {...string} files - One or more file or folder paths to move.
   * @returns {Promise<Array<{ source: string, destination: string }>>} List of moved files with their destinations.
   */
  static async move(dest, ...files) {
    const results = [];

    for (const file of files) {
      const target = path.join(dest, path.basename(file));
      await fs.move(file, target);
      results.push({ source: file, destination: target });
    }

    return results;
  }

  /**
   * Removes one or more files or directories.
   * 
   * @param {...string} files - One or more file or folder paths to remove.
   * @returns {Promise<Array<{ file: string, removed: boolean }>>} List of removed files.
   */
  static async remove(...files) {
    const results = [];

    for (const file of files) {
      await fs.remove(file);
      results.push({ file, removed: true });
    }

    return results;
  }

  /**
   * Executes a shell command in a given working directory.
   * 
   * @param {string} cmd - The shell command to execute.
   * @param {string} [cwd=process.cwd()] - The working directory to run the command in.
   * @returns {Promise<{ stdout: string, stderr: string }>} Command output.
   */
  static async exec(cmd, cwd = process.cwd()) {
    const { stdout, stderr } = await execAsync(cmd, { cwd });
    return { stdout, stderr };
  }
}
