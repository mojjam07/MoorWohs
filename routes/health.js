const express = require('express');
const router = express.Router();
const { diagnoseSupabase, isUsingServiceRole } = require('../db/db');

// Health check
router.get('/', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Diagnostic endpoint for Supabase configuration and RLS issues
router.get('/diagnose', async (req, res) => {
  try {
    const diagnostics = await diagnoseSupabase();
    
    res.json({
      timestamp: new Date().toISOString(),
      serviceRoleEnabled: isUsingServiceRole,
      supabase: diagnostics,
      recommendations: []
    });

    // Add recommendations based on diagnostics
    if (!diagnostics.serviceRoleKeyConfigured) {
      diagnostics.recommendations = diagnostics.recommendations || [];
      diagnostics.recommendations.push({
        type: 'critical',
        message: 'SUPABASE_SERVICE_ROLE_KEY is not configured',
        fix: 'Set SUPABASE_SERVICE_ROLE_KEY environment variable in your backend deployment',
        impact: 'RLS policies may block read/write operations on projects and skills tables'
      });
    }

    // Check if any tables are inaccessible
    const inaccessibleTables = Object.entries(diagnostics.tables)
      .filter(([_, info]) => !info.accessible)
      .map(([table, _]) => table);

    if (inaccessibleTables.length > 0) {
      diagnostics.recommendations = diagnostics.recommendations || [];
      diagnostics.recommendations.push({
        type: 'warning',
        message: `Cannot access table(s): ${inaccessibleTables.join(', ')}`,
        fix: 'Check RLS policies and ensure service role key has proper permissions',
        impact: 'Admin operations may fail for these tables'
      });
    }

  } catch (error) {
    console.error('Diagnostics error:', error);
    res.status(500).json({
      error: 'Failed to run diagnostics',
      message: error.message
    });
  }
});

module.exports = router;
