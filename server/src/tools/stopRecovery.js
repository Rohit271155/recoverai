// Recovery Tool: Stop Recovery
export const stopRecoveryTool = {
  name: 'STOP_RECOVERY',
  description: 'Stops automated recovery workflows after policy limits or permanent default.',

  async execute({ transaction, customer, simulationOutcome, reason }) {
    return {
      tool: 'STOP_RECOVERY',
      success: true,
      isStopped: true,
      result: 'RECOVERY_STOPPED',
      amountRecovered: 0,
      message: `Automated recovery terminated: ${reason || 'Permanent failure code or safety limit reached.'}`,
      timestamp: new Date().toISOString(),
    };
  },
};

export default stopRecoveryTool;
