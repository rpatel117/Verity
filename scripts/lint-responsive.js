#!/usr/bin/env node
const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const antiPatterns = [
  { pattern: /class="[^"]*w-\[(\d+)\][^"]*"/g, message: 'Fixed pixel width found' },
  { pattern: /min-w-\[(\d+px)\][^"]*>/g, message: 'Fixed min-width > 320px on content' },
  { pattern: /overflow-hidden[^"]*on[^"]*main/g, message: 'overflow-hidden on main container' },
]

let files = []
try {
  const result = execSync('find . -name "*.tsx" -o -name "*.jsx" | grep -v node_modules | grep -v ".next"', { encoding: 'utf-8' })
  files = result.trim().split('\n').filter(Boolean)
} catch (error) {
  console.error('Error finding files:', error.message)
  process.exit(1)
}

let issues = []

files.forEach(file => {
  try {
    const content = fs.readFileSync(file, 'utf-8')
    antiPatterns.forEach(({ pattern, message }) => {
      const matches = content.match(pattern)
      if (matches) {
        issues.push({ file, message, matches: matches.length })
      }
    })
  } catch (error) {
    // Skip files that can't be read
    console.warn(`Warning: Could not read ${file}: ${error.message}`)
  }
})

if (issues.length > 0) {
  console.error('❌ Responsive lint issues found:')
  issues.forEach(({ file, message, matches }) => {
    console.error(`  ${file}: ${message} (${matches} occurrences)`)
  })
  process.exit(1)
} else {
  console.log('✅ No responsive lint issues found')
}

