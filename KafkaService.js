var kafka = require('kafka-node'),
    Producer = kafka.Producer,
    Consumer = kafka.Consumer;
var producer = null;
var consumer = null;

module.exports = {
    startProducer: function(callbackFunc){
        try{
            producerClient = new kafka.KafkaClient({
                kafkaHost: 'kafka:9092'
            });
            producer = new Producer(producerClient);
            producer.on('ready', function(){
                    console.log('Producer is ready');
            });
            producer.on('error', function (err) {
                    console.log('Producer-Error: ' + err);
            });
        }
        catch(err){
            console.log('Producer: ' + err);
            callbackFunc(err);
        }
    },
    /*
        Inputs: 
            msgCtx : {
                topicName: <topicName>,
                message: <message>,
                partition: <partitionNumber>
            }
        Returns:
            callbackFunc(err, data)
    */
    sendMessage: function(msgCtx, callbackFunc){
        try {
            payload = [
                { 
                    topic: msgCtx.topicName, 
                    messages: msgCtx.message, 
                    partition: msgCtx.partition
                }
            ];
            producer.send(payload, function (err, data) {
                if (console.log()) {
                    console.log('Producer-Send: ' + err);
                }
                if(err){
                    callbackFunc(err);
                }
            });
        } catch (error) {
            console.log('Producer-Send: ' + err);
            callbackFunc(error);
        }
    },

    /*
        Inputs: consumerCtx -> {grp_id: <consumerGrpId>, 
                                topic_name: <topicName>, 
                                onMsgHook: <functionName>}, 
                callbackFunc
        Returns: callbackFunc(err)
    */
    startConsumer: function(consumerCtx, callbackFunc) {
        try{
            consumerClient = new kafka.KafkaClient({
                kafkaHost: 'kafka:9092'
            });
            consumer = new Consumer(consumerClient,
                [
                    { 
                        topic: consumerCtx.topicName, 
                        partition: consumerCtx.partition 
                    }
                ],
                {
                    groupId: consumerCtx.consumerGrpId,
                    autoCommit: true               
		}
            );
            consumer.on('ready', function(){
                    console.log('Consumer is ready');
            });

            consumer.on('error', function (err) {
                    console.log('Consumer-Error: ' + err);
            });

            consumer.on('offsetOutOfRange', function (err) {
                    console.log('Consumer-OffsetOutOfRange: ' + err);
            });

            consumer.on('message', function (message) {
                consumerCtx.onMsgHook(message);
            });
        }
        catch(err){
            console.log('Consumer: ' + err);
            callbackFunc(err);
        }
    },
    closeConsumer: function(){
	consumer.close(true, function(err){
		console.log('close----' + err);
	});
    },

};

module.exports.startProducer(function(err){
    console.log('Failed to start producer: ' + err);
});

module.exports.startConsumer({consumerGrpId:'docker-kafka-1', 
    topicName: 'device_type', 
    partition: 0,
    onMsgHook: function(msg){
        console.log('Received Msg: ' + msg.value + ' - type - ' + (typeof msg));
    }},
        function(err){
    		console.log('Failed to start consumer: ' + err);
});

module.exports.sendMessage({
        topicName: 'device_type',
        message: 'Hello!!',
        partition: 0
    }, function(err){
        console.log('Failed to send message: ' + err);
    }
);

setTimeout(module.exports.closeConsumer, 300);
