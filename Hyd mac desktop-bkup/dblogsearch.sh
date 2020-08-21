!/bin/bash

#Setting JBOSS_HOME variable and log files locations
JBOSS_HOME=/root/eTechLogs_v2/wildfly-14.0.1.Final
[ -d ./log_errors ] || mkdir ./log_errors
timestamp=`date '+%Y-%m-%d_%H:%M:%S'`
errorLogfilelocation=./log_errors
errorLogfilename=dberrorlog.$timestamp
errorLogfile="$errorLogfilelocation/$errorLogfilename"
logFilelocation=$JBOSS_HOME/standalone/log
logFilename=`ls -t $logFilelocation | grep "^server*" | head -n 1`
logFile="$logFilelocation/$logFilename"

#Logic for fetching the error logs from the log file
pattern=ORA
#Add the 'ORA' error codes in the '$no' variable to include such db errors
declare -a no=()
no+=(01408)
no+=(02275)
echo "Extracting ORA errors from '$logFilename'..."
dberror=""
flag=0
while IFS= read -r line
do
 if [[ "$line" == 2* ]]
  then
    if [[ $flag == 1 ]]
    then
      match=`echo -e $dberror|grep $pattern`
      if [ ! -z "$match" ]
      then
        match_flag=0
        for i in ${no[@]}
        do
          test=`echo -e $dberror|grep $i`
          if [ ! -z "$test" ]
          then
            match_flag=1
          fi
        done
        if [[ $match_flag == 1 ]]
        then
          echo -e $dberror >> $errorLogfile
        fi
      fi
      dberror="$line"
    else
      dberror+="\n$line"
    fi
    flag=1
  else
    dberror+="\n$line"
  fi
done < $logFile

if [ -e "$errorLogfile" ]; then
error_flag=0
echo "dbErrors from log file '$logFilename' extracted to '$errorLogfilename' Successfully!"
else
error_flag=1
echo "No DB errors found"
fi
