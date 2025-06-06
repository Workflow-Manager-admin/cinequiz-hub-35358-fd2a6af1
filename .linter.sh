#!/bin/bash
cd /home/kavia/workspace/code-generation/cinequiz-hub-35358-fd2a6af1/cinequiz_hub
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

