/**
 * Base class for all Maritime Intelligence Agents
 */
export class BaseAgent {
  constructor(name, description) {
    this.name = name;
    this.description = description;
  }

  async process(context) {
    throw new Error('Method not implemented');
  }

  log(message) {
    console.log(`[${this.name}] ${message}`);
  }
}
