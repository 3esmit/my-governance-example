print_enode() {
    if [ -S $IPC_FILE ]; then
        enode=`$NODE_BIN attach $IPC_FILE --exec "admin.nodeInfo.enode"`
    else
        enode=`$NODE_BIN attach ws://$ETH_RPC_WS_ADDRESS:$ETH_RPC_WS_PORT --exec "admin.nodeInfo.enode"`
    fi
    echo $enode
}

# read account address
eth_get_account() {
    if [ -S $IPC_FILE ]; then
        run_cmd="$NODE_BIN --ipcpath=$IPC_FILE account list"
    else
        run_cmd="$NODE_BIN --keystore=$KEYSTORE_DIR/$ETH_NETWORK_NAME account list"
    fi
    echo "executing: $run_cmd"
    echo `$run_cmd 2>> /dev/null`
}

eth_new_account() {
    if [ -S $IPC_FILE ]; then
        run_cmd="$NODE_BIN --ipcpath=$IPC_FILE account new"
    else
        run_cmd="$NODE_BIN --keystore=$KEYSTORE_DIR/$ETH_NETWORK_NAME --password=$DEPLOY_PASSWORD_FILE account new"
    fi
    $run_cmd
}

# run ethereum node
eth_run() {
    [ -d $ETH_TEMP ] || mkdir $ETH_TEMP
    if [ -z "$ETH_DEPLOY_ADDRESS" ]; then
        echo "Must define ETH_DEPLOY_ADDRESS in environment" 1>&2
        exit 1
    fi
    if [ ! -f "$DEPLOY_PASSWORD_FILE" ]; then
        echo "Password file not found"
        exit 1
    fi
    if [ ! "$ETH_RPC_HTTP_ADDRESS" = "localhost" ]; then
        echo "ETH_RPC_HTTP_ADDRESS must be localhost" 1>&2
        exit 1
    fi

    if [ ! "$ETH_RPC_WS_ADDRESS" = "localhost" ]; then
        echo "ETH_RPC_WS_ADDRESS must be localhost" 1>&2
        exit 1
    fi
    network_param="--$ETH_NETWORK_NAME"
    filesystem_param="--datadir=$DATA_DIR --ipcpath=$IPC_FILE"
    account_param="--keystore=$KEYSTORE_DIR/$ETH_NETWORK_NAME --password=$DEPLOY_PASSWORD_FILE --unlock=$ETH_DEPLOY_ADDRESS --allow-insecure-unlock"
    sync_param="--syncmode=light --gcmode=archive "
    p2p_param="--port=$ETH_P2P_PORT --maxpeers=$ETH_P2P_MAX_PEERS"
    ws_param="--ws --ws.port=$ETH_RPC_WS_PORT --ws.addr=$ETH_RPC_WS_ADDRESS --ws.origins=$ETH_RPC_ALLOWED_ORIGINS --ws.api=$ETH_RPC_API"
    rpc_param="--http --http.port=$ETH_RPC_HTTP_PORT --http.addr=$ETH_RPC_HTTP_ADDRESS --http.corsdomain=$ETH_RPC_ALLOWED_ORIGINS --http.api=$ETH_RPC_API"
    run_cmd="$NODE_BIN $network_param $filesystem_param $sync_param $p2p_param $ws_param $rpc_param $extra_param $account_param $ETH_EXTRA_PARAMS" 
    if [ -S $IPC_FILE ]; then
        echo "eth already running eth node"
    else
        echo "executing: $run_cmd"
        $run_cmd 2>> $ETH_LOG_FILE &
        while [ ! -S $IPC_FILE ]; 
        do
            sleep 1
        done
    fi

}

## open interactive shell with Geth
eth_attach() {
    if [ -S $IPC_FILE ]; then
        run_cmd="$NODE_BIN attach $IPC_FILE"
    else
        run_cmd="$NODE_BIN attach ws://$ETH_RPC_WS_ADDRESS:$ETH_RPC_WS_PORT"
    fi
    echo "executing: $run_cmd"
    $run_cmd
}

wait_sync() {
    attach_cmd="$NODE_BIN attach $IPC_FILE"
    while [ `$attach_cmd --exec "net.peerCount != 0 && eth.blockNumber != 0 ? 1 : 0"` -eq 0 ] ; 
    do 
        echo "Searching for peers..."
        tail -n 2 $ETH_LOG_FILE
        sleep 10
    done
    while [ `$attach_cmd --exec "net.peerCount != 0 && eth.syncing === false ? 1 : 0"` -eq 0 ] ; 
    do 
        echo "Sync in progress..."
        tail -n 1 $ETH_LOG_FILE
        sleep 10
    done
}

usage()
{
    echo "usage: ethereum [flags] <function> <params>"
    echo "-i, --enode"
    echo "-S, --wait-sync"
    echo "-L. --list-accounts"
    echo "run"
    echo "attach"
}

while [ "$1" != "" ]; do
    case $1 in
        -i | --enode )               enode=1
                                ;;
        -S | --wait-sync )      waits=1
                                ;;
        -L | --list-accounts )  acc_list=1
                                ;;
        --new-account )         acc_new=1
                                ;;
        attach )                attach=1
                                ;;
        run )                   start_eth=1
                                ;;
        -h | --help )           usage
                                exit
                                ;;
        * )                     usage
                                exit 1
    esac
    shift
done

if [ $start_eth ]; then
    eth_run
fi

if [ $enode ]; then
    print_enode
fi

if [ $acc_new ]; then
    eth_new_account
fi

if [ $acc_list ]; then
    eth_get_account
fi

if [ $waits ]; then
    wait_sync
fi

if [ $attach ]; then
    eth_attach
fi
    