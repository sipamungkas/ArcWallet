import React, {useState, useEffect} from 'react';
import {API_URL} from '@env';
import styles from './style';
import {
  ActivityIndicator,
  Modal,
  StatusBar,
  TouchableWithoutFeedback,
} from 'react-native';
import {
  Footer,
  List,
  ListItem,
  View,
  Container,
  CardItem,
  Thumbnail,
  Content,
  Left,
  Right,
  Body,
  Icon,
  Text,
} from 'native-base';
import NetFlixLogo from '../../assets/img/logo-netflix.png';
import SpotifyLogo from '../../assets/img/logo-spotify.png';
import axios from 'axios';
import moment from 'moment';
import {shallowEqual, useSelector} from 'react-redux';
import Money from '../../assets/img/topup.png';
import DefaultProfile from '../../assets/img/blank-profile.png';
import DatePicker from 'react-native-date-picker';

const renderText = (typeId, sender, receiver, receiver_name, userId, notes) => {
  if (typeId === 3) return `${notes}`;
  if (typeId === 1 && receiver == userId) return `${sender}`;
  if (typeId === 2) return 'Top Up';
  return `${receiver_name} `;
};

const renderIcon = (
  type,
  receiver,
  userId,
  senderAvatar,
  receiverAvatar,
  notes,
) => {
  if (type === 3) {
    if (notes.toLowerCase() === 'spotify') return SpotifyLogo;
    return NetFlixLogo;
  }
  if (receiver != userId && receiverAvatar == null) {
    return DefaultProfile;
  }
  return {
    uri: `${API_URL}/images/${
      receiver == userId ? senderAvatar : receiverAvatar
    }`,
  };
};

function TransactionHistory({navigation}) {
  const [endDate, setEndDate] = useState(moment());
  const [startDate, setStartDate] = useState(moment().subtract(7, 'days'));
  const [showDate, setShowDate] = useState(false);
  const [page, setPage] = useState('1');
  const [filter, setFilter] = useState('all');
  const [transactions, setTransactions] = useState([]);

  const auth = useSelector(state => state.auth, shallowEqual);

  const [isLoading, setIsLoading] = useState(true);

  const token = auth.results.token;
  const userId = auth.results.id;

  useEffect(() => {
    console.log('effect');
    setTransactions([]);
    setIsLoading(true);
    console.log(
      `${API_URL}/v1/transactions?page=${page}&limit=${100}&filter=${filter}&start=${moment(
        startDate,
      ).format('yyyy-MM-DD')}&end=${moment(endDate).format('yyyy-MM-DD')}`,
    );
    axios
      .get(
        `${API_URL}/v1/transactions?page=${page}&limit=${100}&filter=${filter}&start=${moment(
          startDate,
        ).format('yyyy-MM-DD')}&end=${moment(endDate).format('yyyy-MM-DD')}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )
      .then(res => {
        setTransactions(res.data.data);
        setIsLoading(false);
      })
      .catch(err => {
        console.log(err);
        setTransactions([]);
        setIsLoading(false);
      });
  }, [filter, showDate]);

  const setFilterIncome = () => {
    if (filter === 'income') {
      setFilter('all');
    } else {
      setFilter('income');
    }
  };
  console.log(endDate);
  const setFiltereExpense = () => {
    if (filter === 'expense') {
      setFilter('all');
    } else {
      setFilter('expense');
    }
  };

  return (
    <Container>
      <StatusBar animated={true} backgroundColor="#FFFFFF" />
      <CardItem style={styles.headerCard}>
        <Left>
          <Icon
            onPress={() => navigation.goBack()}
            type="MaterialCommunityIcons"
            name="arrow-left"
            style={{color: '#4D4B57'}}
          />
          <Text style={styles.text1}>History</Text>
        </Left>
      </CardItem>
      <Content>
        <Modal
          animationType="slide"
          visible={showDate}
          onRequestClose={() => {
            setShowDate(!showDate);
          }}>
          <View
            style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <Text style={{textAlign: 'center'}}>Start Date</Text>
            <DatePicker
              date={startDate}
              onDateChange={setStartDate}
              mode="date"
            />
            <Text style={{textAlign: 'center'}}>End Date</Text>
            <DatePicker
              date={endDate}
              onDateChange={setEndDate}
              mode="date"
              minimumDate={startDate}
            />
            <TouchableWithoutFeedback onPress={() => setShowDate(!showDate)}>
              <Text style={{fontSize: 20, marginTop: 20}}>Confirm</Text>
            </TouchableWithoutFeedback>
          </View>
        </Modal>

        <View style={styles.containerHistory}>
          {transactions.length === 0 &&
            (isLoading ? (
              <ActivityIndicator size={40} color="#6379F4" />
            ) : (
              <Text style={{textAlign: 'center', marginTop: 40}}>
                No Transaction History
              </Text>
            ))}
          {transactions.map((transaction, i) => (
            <List key={i} style={{marginLeft: -15, marginBottom: 20}}>
              <ListItem
                elevation={3}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 10,
                  padding: 10,
                }}
                thumbnail>
                <Left>
                  <Thumbnail
                    source={
                      transaction.type_id === 2
                        ? Money
                        : renderIcon(
                            transaction.type_id,
                            transaction.receiver,
                            userId,
                            transaction.sender_avatar,
                            transaction.receiver_avatar,
                            transaction.notes,
                          )
                    }
                  />
                </Left>
                <Body>
                  <Text style={styles.text2}>
                    {renderText(
                      transaction.type_id,
                      transaction.sender_name,
                      transaction.receiver,
                      transaction.receiver_name,
                      userId,
                      transaction.notes,
                    )}
                  </Text>
                  <Text style={styles.text3}>{transaction.type}</Text>
                  <Text style={styles.text3}></Text>
                </Body>
                <Right>
                  {transaction.receiver == userId ||
                  transaction.type_id === 2 ? (
                    <Text style={styles.plusText}>+Rp{transaction.amount}</Text>
                  ) : (
                    <Text style={styles.minusText}>
                      -Rp{transaction.amount}
                    </Text>
                  )}
                </Right>
              </ListItem>
            </List>
          ))}
        </View>
        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-around',
            marginBottom: 50,
          }}>
          <TouchableWithoutFeedback onPress={setFiltereExpense}>
            <View
              elevation={5}
              style={{borderRadius: 12, backgroundColor: '#FFFFFF', width: 57}}>
              <Icon
                style={{textAlign: 'center', fontSize: 35, color: '#FF5B37'}}
                type="MaterialCommunityIcons"
                name="arrow-up"
              />
            </View>
          </TouchableWithoutFeedback>
          <TouchableWithoutFeedback onPress={setFilterIncome}>
            <View
              elevation={5}
              style={{borderRadius: 12, backgroundColor: '#FFFFFF', width: 57}}>
              <Icon
                style={{textAlign: 'center', fontSize: 35, color: '#4CEDB3'}}
                type="MaterialCommunityIcons"
                name="arrow-down"
              />
            </View>
          </TouchableWithoutFeedback>
          <TouchableWithoutFeedback
            onPress={() => {
              setShowDate(true);
            }}>
            <View
              elevation={5}
              style={{
                borderRadius: 12,
                backgroundColor: '#FFFFFF',
                width: 200,
              }}>
              <Text style={styles.blueText1}>Filter By Date</Text>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </Content>
    </Container>
  );
}
export default TransactionHistory;
