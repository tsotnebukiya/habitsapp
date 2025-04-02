// components/GenericCard.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { FontAwesome, FontAwesome6 } from '@expo/vector-icons';

interface GenericCardProps {
  title: string;
  titleIcon: string;
  metric: string;
  metricUnit: string;
  status: string;
  statusIcon: string;
}
const GenericCard = ({
  title,
  titleIcon,
  metric,
  metricUnit,
  status,
  statusIcon,
}: GenericCardProps) => {
  return (
    <TouchableOpacity style={styles.container}>
      <View style={styles.Content}>
        <View style={{ flexDirection: 'row' }}>
          <FontAwesome6
            name={titleIcon}
            size={16}
            color="gray"
            style={{ marginRight: 5, marginTop: 3 }}
          />
          <Text style={styles.title}>{title}</Text>
        </View>
        <FontAwesome name="chevron-right" size={16} color="gray" />
      </View>

      <View
        style={{ flexDirection: 'column', justifyContent: 'space-between' }}
      >
        <Text style={styles.metric}>
          {metric} <Text style={styles.unit}>{metricUnit}</Text>
        </Text>
        <View style={{ flexDirection: 'row' }}>
          <FontAwesome6
            name={statusIcon}
            size={14}
            color="gray"
            style={{ marginRight: 5, marginTop: 4 }}
          />
          <Text style={styles.status}>{status}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    maxHeight: 130,
    backgroundColor: '#fff',
    borderRadius: 20,
    borderColor: '#d3d3d3',
    padding: 15,
    marginVertical: 10,
    marginHorizontal: 5,
    elevation: 3,
  },
  Content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  title: {
    fontSize: 16,
    marginLeft: 0,
  },
  metric: {
    fontSize: 35,
    fontWeight: 'bold',
    color: '#000',
  },
  unit: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  status: {
    color: 'gray',
    fontSize: 16,
  },
});

export default GenericCard;
