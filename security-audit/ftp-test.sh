#!/bin/bash
(echo "USER anonymous"
 sleep 1
 echo "PASS anonymous"
 sleep 1
 echo "SYST"
 sleep 1
 echo "QUIT") | nc neofreight.net 21
