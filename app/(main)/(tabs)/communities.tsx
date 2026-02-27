import { ChevronRight, Plus, Users } from 'lucide-react-native';
import React from 'react';
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../../constants/Colors';

const MOCK_COMMUNITIES = [
    {
        id: '1',
        name: 'Neighborhood Watch',
        avatar: 'https://via.placeholder.com/150/FF6B81/FFFFFF?text=NW',
        groups: [
            { id: '1a', name: 'Announcements', lastMessage: 'Meeting at 5PM.', time: '10:00 AM', isAnnouncements: true },
            { id: '1b', name: 'General Chatter', lastMessage: 'Did anyone hear that noise?', time: 'Yesterday' },
        ]
    },
    {
        id: '2',
        name: 'Tech Enthusiasts Local',
        avatar: 'https://via.placeholder.com/150/CDB4DB/FFFFFF?text=TE',
        groups: [
            { id: '2a', name: 'Announcements', lastMessage: 'New hackathon next month!', time: 'Mon', isAnnouncements: true },
            { id: '2b', name: 'React Native devs', lastMessage: 'How do I use Reanimated?', time: 'Tue' },
            { id: '2c', name: 'Hardware hacking', lastMessage: 'Just got a new Raspberry Pi', time: 'Wed' },
        ]
    }
];

export default function CommunitiesScreen() {
    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.newCommunityBtn}>
                <View style={styles.newCommunityIconBg}>
                    <Users size={24} color="#FFF" />
                    <View style={styles.newCommunityPlus}>
                        <Plus size={16} color="#FFF" />
                    </View>
                </View>
                <Text style={styles.newCommunityText}>New community</Text>
            </TouchableOpacity>

            <View style={styles.divider} />

            <FlatList
                data={MOCK_COMMUNITIES}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.communityBlock}>
                        <View style={styles.communityHeader}>
                            <Image source={{ uri: item.avatar }} style={styles.communityAvatar} />
                            <Text style={styles.communityName}>{item.name}</Text>
                        </View>

                        {item.groups.map((group, index) => (
                            <TouchableOpacity key={group.id} style={styles.groupRow}>
                                <View style={styles.groupIconWrapper}>
                                    {group.isAnnouncements ? (
                                        <View style={styles.announcementIconBg}>
                                            <Users size={18} color="#FFF" />
                                        </View>
                                    ) : (
                                        <Image source={{ uri: 'https://via.placeholder.com/150/EFEFEF/999?text=G' }} style={styles.groupAvatar} />
                                    )}
                                </View>
                                <View style={styles.groupInfo}>
                                    <View style={styles.groupNameRow}>
                                        <Text style={[styles.groupName, group.isAnnouncements && styles.groupNameAnnounce]}>{group.name}</Text>
                                        <Text style={styles.groupTime}>{group.time}</Text>
                                    </View>
                                    <Text style={styles.groupLastMsg} numberOfLines={1}>{group.lastMessage}</Text>
                                </View>
                            </TouchableOpacity>
                        ))}

                        <TouchableOpacity style={styles.viewAllRow}>
                            <ChevronRight size={20} color={Colors.secondaryText} />
                            <Text style={styles.viewAllText}>View all</Text>
                        </TouchableOpacity>
                    </View>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F0F0F0', // Slightly darker bg to separate blocks
    },
    newCommunityBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        backgroundColor: Colors.background,
    },
    newCommunityIconBg: {
        width: 50,
        height: 50,
        borderRadius: 10,
        backgroundColor: '#D1D5DB', // gray
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        marginRight: 15,
    },
    newCommunityPlus: {
        position: 'absolute',
        bottom: -5,
        right: -5,
        backgroundColor: Colors.primary,
        borderRadius: 10,
        width: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: Colors.background,
    },
    newCommunityText: {
        fontSize: 17,
        fontWeight: 'bold',
        color: Colors.text,
    },
    divider: {
        height: 10,
    },
    communityBlock: {
        backgroundColor: Colors.background,
        marginBottom: 10,
    },
    communityHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    communityAvatar: {
        width: 40,
        height: 40,
        borderRadius: 10,
        marginRight: 15,
    },
    communityName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.text,
    },
    groupRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingLeft: 40,
        paddingRight: 15,
    },
    groupIconWrapper: {
        width: 45,
        alignItems: 'center',
        marginRight: 10,
    },
    announcementIconBg: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: '#A0A0A0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    groupAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
    },
    groupInfo: {
        flex: 1,
        borderBottomWidth: 1,
        borderBottomColor: '#F5F5F5',
        paddingBottom: 12,
    },
    groupNameRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    groupName: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text,
    },
    groupNameAnnounce: {
        fontWeight: 'bold',
    },
    groupTime: {
        fontSize: 12,
        color: Colors.secondaryText,
    },
    groupLastMsg: {
        fontSize: 14,
        color: Colors.secondaryText,
    },
    viewAllRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        paddingLeft: 30,
    },
    viewAllText: {
        fontSize: 15,
        color: Colors.secondaryText,
        marginLeft: 5,
        fontWeight: '500',
    },
});
