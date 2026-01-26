# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is an nginx web server root directory (`www/html`). It serves static files via nginx.

## Structure

- `index.nginx-debian.html` - Default nginx welcome page

## Development

This directory is where static web content should be placed for nginx to serve. To add web content:
1. Place HTML, CSS, JS, and other static files in this directory
2. Nginx will serve them automatically based on its configuration

The nginx configuration is typically located at `/etc/nginx/nginx.conf` or `/etc/nginx/sites-enabled/` on the system.
