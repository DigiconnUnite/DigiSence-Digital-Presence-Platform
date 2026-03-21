#!/bin/bash

# =============================================================================
# DigiSence Git Workflow Automation Script
# =============================================================================
# This script automates the Git branching and merging workflow for audit fixes
# 
# Usage:
#   ./scripts/git-workflow.sh init    - Initialize all branches
#   ./scripts/git-workflow.sh merge   - Merge feature branches to develop
#   ./scripts/git-workflow.sh release - Release to production (main)
#   ./scripts/git-workflow.sh status  - Show branch status
#   ./scripts/git-workflow.sh help    - Show this help message
# =============================================================================

set -e  # Exit on any error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Feature branches array (in merge priority order)
FEATURE_BRANCHES=(
    "feature/audit-fixes-security"
    "feature/audit-fixes-architecture"
    "feature/audit-fixes-performance"
    "feature/audit-fixes-accessibility"
)

# =============================================================================
# Helper Functions
# =============================================================================

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if git repository
check_git_repo() {
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        log_error "Not a Git repository. Please run from project root."
        exit 1
    fi
}

# Get current branch
get_current_branch() {
    git branch --show-current
}

# Check if branch exists
branch_exists() {
    git rev-parse --verify "$1" > /dev/null 2>&1
}

# =============================================================================
# Initialize Branches
# =============================================================================

init_branches() {
    log_info "Initializing Git workflow branches..."
    
    # Check if we're on main branch
    if ! branch_exists "main"; then
        log_error "Main branch does not exist. Please ensure you have a main branch."
        exit 1
    fi
    
    # Checkout main and ensure it's up to date
    log_info "Checking out main branch..."
    git checkout main
    git pull origin main
    
    # Create develop branch if it doesn't exist
    if branch_exists "develop"; then
        log_warning "Develop branch already exists. Skipping creation."
    else
        log_info "Creating develop branch from main..."
        git checkout -b develop
        git push -u origin develop
        log_success "Created develop branch"
    fi
    
    # Create feature branches
    for branch in "${FEATURE_BRANCHES[@]}"; do
        if branch_exists "$branch"; then
            log_warning "Branch $branch already exists. Skipping creation."
        else
            log_info "Creating $branch branch from develop..."
            git checkout -b "$branch" develop
            git push -u origin "$branch"
            log_success "Created $branch branch"
        fi
    done
    
    # Return to develop branch
    git checkout develop
    
    echo ""
    log_success "Branch initialization complete!"
    echo ""
    echo "Branch structure:"
    echo "  main                              <- Production"
    echo "  develop                           <- Integration"
    echo "  feature/audit-fixes-security     <- Security fixes"
    echo "  feature/audit-fixes-architecture <- Architecture improvements"
    echo "  feature/audit-fixes-performance   <- Performance optimizations"
    echo "  feature/audit-fixes-accessibility <- Accessibility fixes"
    echo ""
}

# =============================================================================
# Merge Feature Branches
# =============================================================================

merge_branches() {
    log_info "Merging feature branches to develop..."
    
    # Ensure we're on develop branch
    git checkout develop
    git pull origin develop
    
    # Merge each feature branch in priority order
    for branch in "${FEATURE_BRANCHES[@]}"; do
        echo ""
        log_info "Merging $branch..."
        
        if branch_exists "$branch"; then
            # Check if there are any changes to merge
            if git merge --no-ff --no-commit "$branch" 2>/dev/null; then
                # Check if there are actual conflicts
                if git diff --name-only --cached | grep -q .; then
                    log_warning "Merge conflict detected in $branch"
                    log_warning "Please resolve conflicts manually and commit."
                    git merge --abort
                else
                    # No conflicts, complete the merge
                    git commit -m "merge: merge $branch into develop"
                    log_success "Merged $branch"
                fi
            else
                # Merge failed (conflicts)
                log_warning "Merge conflict with $branch"
                log_warning "Please resolve conflicts manually."
                git merge --abort
            fi
        else
            log_warning "Branch $branch does not exist. Skipping."
        fi
    done
    
    # Push merged develop branch
    log_info "Pushing develop branch to remote..."
    git push origin develop
    
    echo ""
    log_success "Merge complete!"
    echo ""
    echo "Next steps:"
    echo "  1. Review changes in develop branch"
    echo "  2. Run tests to verify everything works"
    echo "  3. Run: ./scripts/git-workflow.sh release"
    echo ""
}

# =============================================================================
# Release to Production
# =============================================================================

release_to_production() {
    local version=${1:-"v1.0.0"}
    
    log_info "Releasing to production..."
    
    # Ensure develop is up to date
    git checkout develop
    git pull origin develop
    
    # Checkout main
    git checkout main
    git pull origin main
    
    # Merge develop to main
    log_info "Merging develop to main..."
    git merge --no-ff develop -m "release: merge develop to main ($version)"
    
    # Tag the release
    log_info "Creating tag $version..."
    git tag -a "$version" -m "Release $version"
    
    # Push everything
    log_info "Pushing to remote..."
    git push origin main
    git push origin develop
    git push origin --tags
    
    log_success "Release $version complete!"
    echo ""
    echo "Released to production:"
    echo "  - main branch updated"
    echo "  - develop branch updated"
    echo "  - Tag $version created"
    echo ""
}

# =============================================================================
# Show Status
# =============================================================================

show_status() {
    log_info "Current branch: $(get_current_branch)"
    echo ""
    
    echo "Local branches:"
    git branch
    
    echo ""
    echo "Remote branches:"
    git branch -r
    
    echo ""
    echo "Recent commits:"
    git log --oneline -10
}

# =============================================================================
# Show Help
# =============================================================================

show_help() {
    echo "DigiSence Git Workflow Automation Script"
    echo ""
    echo "Usage: $0 <command> [options]"
    echo ""
    echo "Commands:"
    echo "  init     Initialize all branches for audit fixes workflow"
    echo "  merge    Merge all feature branches to develop"
    echo "  release  Release develop branch to production (main)"
    echo "  status   Show current branch status and recent commits"
    echo "  help     Show this help message"
    echo ""
    echo "Options for release:"
    echo "  release [version]  Specify version tag (default: v1.0.0)"
    echo ""
    echo "Examples:"
    echo "  $0 init"
    echo "  $0 merge"
    echo "  $0 release v1.2.0"
    echo "  $0 status"
    echo ""
    echo "Branch Structure:"
    echo "  main                              <- Production-ready code"
    echo "  develop                           <- Integration branch"
    echo "  feature/audit-fixes-security     <- Critical security fixes"
    echo "  feature/audit-fixes-architecture <- Architecture improvements"
    echo "  feature/audit-fixes-performance   <- Performance optimizations"
    echo "  feature/audit-fixes-accessibility <- Accessibility fixes"
}

# =============================================================================
# Main Script
# =============================================================================

# Check if git is available
if ! command -v git &> /dev/null; then
    log_error "Git is not installed. Please install Git first."
    exit 1
fi

# Check if we're in a git repository
check_git_repo

# Parse command
COMMAND=${1:-help}

case "$COMMAND" in
    init)
        init_branches
        ;;
    merge)
        merge_branches
        ;;
    release)
        VERSION=${2:-"v1.0.0"}
        release_to_production "$VERSION"
        ;;
    status)
        show_status
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        log_error "Unknown command: $COMMAND"
        echo "Run '$0 help' for usage information."
        exit 1
        ;;
esac
