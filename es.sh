./es/elasticsearch-2.1.1/bin/elasticsearch
./es/kibana/kibana-4.3.1-linux-x64/bin/kibana

./es/logstash/logstash-2.1.1/bin/logstash agent -f es/logstash/logstash-2.1.1/test.conf web

curl -XDELETE http://localhost:9200/logstash-*